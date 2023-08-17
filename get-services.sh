#!/usr/bin/env bash

curl -H "Accept: application/vnd.github+json" \
     -H "Authorization: Bearer ${GITHUB_TOKEN}"\
     -H "X-GitHub-Api-Version: 2022-11-28" \
     -L https://api.github.com/repos/akvo/akvo-flow-server-config/tarball > akvo-flow-server-config.tar.gz

mkdir akvo-flow-server-config
tar -xf akvo-flow-server-config.tar.gz -C akvo-flow-server-config --strip-component=1

echo 'bucket,service,instances' > ./backend/data/flow-survey-amazon-aws.csv
list=$(find ./akvo-flow-server-config -type f -name appengine-web.xml \
    -maxdepth 2 -mindepth 2 \
    -exec echo {} \; 2>/dev/null)
for word in ${list};
do
    service=$(grep "<application>" "${word}"\
        | sed 's/<.*>\(.*\)<.*>/\1/' \
        | sed 's/\ //g')
    bucket=$(grep "s3bucket" "${word}"\
        | sed 's/.*value="\([^"]*\).*/\1/')
    instance=$(grep "alias" "${word}"\
        | sed 's/.*value="\([^"]*\).*/\1/' \
        | cut -d '.' -f 1)
    echo "${bucket},${service},${instance}" | sed 's/\ //g' >> ./backend/data/flow-survey-amazon-aws.csv;
done;

rm -rf akvo-flow-server-config*
