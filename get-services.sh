#!/usr/bin/env bash

serverconfig="akvo/akvo-flow-server-config.git"
curl -H "Authorization: token ${TOKEN}" \
    -L https://api.github.com/repos/${serverconfig}/tarball > akvo-flow-server-config.tar.gz

echo 'bucket,service,instances' > ./data/flow-survey-amazon-aws.csv
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
    echo "${bucket},${service},${instance}" | sed 's/\ //g' >> ./data/flow-survey-amazon-aws.csv;
done;

rm -rf akvo-flow-server-config
