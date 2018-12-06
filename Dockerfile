FROM python:2.7.15

ARG Z3_VERSION="4.8.1"

RUN wget https://github.com/Z3Prover/z3/archive/z3-${Z3_VERSION}.tar.gz \
        && tar xf z3-${Z3_VERSION}.tar.gz \
        && cd z3-z3-${Z3_VERSION} \
        && python scripts/mk_make.py --python \
        && cd build \
        && make -j4 \
        && make install \
        && cd .. && rm -rf z3-${Z3_VERSION}.tar.gz && rm -rf z3-z3-${Z3_VERSION}
