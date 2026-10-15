FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# GeoDjango loads these shared libraries at runtime for geometry parsing and
# spatial operations. Development headers and CLI tools are intentionally not
# installed because this image does not compile native GIS extensions.
RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        binutils \
        libgdal32 \
        libgeos-c1v5 \
        libproj25 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

