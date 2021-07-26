git clone git@github.com:akvo/akvo-flow-server-config.git
echo 'bucket,service,instances' > ./backend/data/flow-survey-amazon-aws.csv
list=$(find ./akvo-flow-server-config -type f -name survey.properties \
    -maxdepth 2 -mindepth 2 \
    -exec echo {} \; 2>/dev/null)
for word in ${list};
do
    service=$(echo ${word} | cut -d '/' -f 3)
    bucket=$(cat ${word} | grep awsBucket | cut -d '=' -f 2)
    instance=$(cat ${word} | grep instanceUrl | cut -d '=' -f 2 \
        | sed 's/https\:\/\///g' \
        | sed 's/.akvoflow.org//g' \
        | sed 's/.appspot.com//g')
    echo "${bucket},${service},${instance}" | sed 's/\ //g' >> ./backend/data/flow-survey-amazon-aws.csv;
done;
rm -rf akvo-flow-server-config
