# Akvo Webform

Web based form integrated with Akvo Flow

## Prerequisite
- Docker > v19
- Docker Compose > v2.1
- Docker Sync 0.7.1

## Dev Setup

The application requires `FLOW_SERVICE_URL` environment variable to be available
```bash
export FLOW_SERVICE_URL={url to the flow service test instance}
```

```bash
docker volume create akvo-webform-docker-sync
./dc.sh up -d
```

The app should be running at: [localhost:3000](http://localhost:3000)

## Deployment

The deployement scripts requires a [token from zulip](https://akvo.zulipchat.com/#settings/account-and-privacy) to send messages to the channel.

```bash
export ZULIP_TOKEN="YOURTOKENHERE"
ci/promote-test-to-prod.sh
```
