FROM amancevice/pandas:slim-2.2.2

WORKDIR /usr/src/app

COPY . .

RUN set -e; \
    pip -q install --upgrade pip && \
    pip -q install --no-cache-dir -r requirements.txt && \
    pip check

CMD ["python", "main.py"]
