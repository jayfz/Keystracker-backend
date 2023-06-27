FROM postgres:15.3-alpine3.18


LABEL author="JFZ"
LABEL description="Postgres Image for KeysTracker"
LABEL version="1.0"

COPY ./database-startup-scripts/*.sql /docker-entrypoint-initdb.d/

