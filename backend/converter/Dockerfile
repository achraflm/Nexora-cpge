FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends libreoffice-writer libreoffice-impress texlive-latex-extra texlive-science texlive-fonts-recommended fonts-liberation && rm -rf /var/lib/apt/lists/*
ENV HOME=/tmp
COPY --chmod=0555 convert.sh /usr/local/bin/convert-resource
USER 65534:65534
WORKDIR /input
ENTRYPOINT ["timeout", "--signal=KILL", "90s", "/usr/local/bin/convert-resource"]
