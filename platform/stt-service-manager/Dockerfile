FROM node:12
LABEL maintainer="irebai@linagora.com"

RUN apt-get update &&\
    apt-get install -y \
    python-dev \
    python-pip \
    automake wget sox unzip swig build-essential libtool zlib1g-dev locales libatlas-base-dev nano ca-certificates gfortran subversion &&\
    apt-get clean


## Build kaldi and Clean installation (intel, openfst, src/*)
RUN git clone --depth 1 https://github.com/kaldi-asr/kaldi.git /opt/kaldi && \
    cd /opt/kaldi && \
    cd /opt/kaldi/tools && \
    ./extras/install_mkl.sh && \
    make -j $(nproc) && \
    cd /opt/kaldi/src && \
    ./configure --shared && \
    make depend -j $(nproc) && \
    make -j $(nproc) && \
    mkdir -p /opt/kaldi/src_/lib && \
    mv /opt/kaldi/src/base/libkaldi-base.so \
       /opt/kaldi/src/chain/libkaldi-chain.so \
       /opt/kaldi/src/decoder/libkaldi-decoder.so \
       /opt/kaldi/src/feat/libkaldi-feat.so \
       /opt/kaldi/src/fstext/libkaldi-fstext.so \
       /opt/kaldi/src/gmm/libkaldi-gmm.so \
       /opt/kaldi/src/hmm/libkaldi-hmm.so \
       /opt/kaldi/src/lat/libkaldi-lat.so \
       /opt/kaldi/src/lm/libkaldi-lm.so \
       /opt/kaldi/src/matrix/libkaldi-matrix.so \
       /opt/kaldi/src/transform/libkaldi-transform.so \
       /opt/kaldi/src/tree/libkaldi-tree.so \
       /opt/kaldi/src/util/libkaldi-util.so \
       /opt/kaldi/src_/lib && \
    mv /opt/kaldi/src/lmbin /opt/kaldi/src/fstbin /opt/kaldi/src/bin /opt/kaldi/src_ && \
    rm -rf /opt/kaldi/src && mv /opt/kaldi/src_ /opt/kaldi/src && \
    cd /opt/kaldi/src && rm -f lmbin/*.cc lmbin/*.o lmbin/Makefile fstbin/*.cc fstbin/*.o fstbin/Makefile bin/*.cc bin/*.o bin/Makefile && \
    cd /opt/intel/mkl/lib && rm -f intel64/*.a intel64_lin/*.a && \
    cd /opt/kaldi/tools && mkdir openfsttmp && mv openfst-*/lib openfst-*/include openfst-*/bin openfsttmp && rm openfsttmp/lib/*.a openfsttmp/lib/*.la && \
    rm -r openfst-*/* && mv openfsttmp/* openfst-*/ && rm -r openfsttmp


## Install NLP packages
RUN cd /opt/kaldi/tools && \
    extras/install_phonetisaurus.sh && \
    extras/install_irstlm.sh && \
    pip install numpy && \
    pip install git+https://github.com/sequitur-g2p/sequitur-g2p && git clone https://github.com/sequitur-g2p/sequitur-g2p

## Install npm modules
WORKDIR /usr/src/app
COPY ./package.json ./
RUN npm install

## Prepare work directories
COPY ./components ./components
COPY ./lib ./lib
COPY ./models /usr/src/app/models
COPY ./app.js ./config.js ./.defaultparam ./docker-healthcheck.js ./docker-entrypoint.sh ./wait-for-it.sh ./
RUN mkdir /opt/model /opt/nginx && cp -r /opt/kaldi/egs/wsj/s5/utils ./components/LinSTT/Kaldi/scripts/

ENV LD_LIBRARY_PATH $LD_LIBRARY_PATH:/opt/kaldi/tools/openfst/lib
ENV PATH /opt/kaldi/egs/wsj/s5/utils:/opt/kaldi/tools/openfst/bin:/opt/kaldi/src/fstbin:/opt/kaldi/src/lmbin:/opt/kaldi/src/bin:/opt/kaldi/tools/phonetisaurus-g2p/src/scripts:/opt/kaldi/tools/phonetisaurus-g2p:/opt/kaldi/tools/sequitur-g2p/g2p.py:/opt/kaldi/tools/irstlm/bin:$PATH

EXPOSE 80

HEALTHCHECK CMD node docker-healthcheck.js || exit 1

# Entrypoint handles the passed arguments
ENTRYPOINT ["./docker-entrypoint.sh"]

#CMD [ "npm", "start" ]
