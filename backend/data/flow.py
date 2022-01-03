import pandas as pd


def xml_survey(instance: str):
    instances = pd.read_csv('./data/flow-survey-amazon-aws.csv')
    instances = instances[instances['instances'] == instance]
    if instances.shape[0]:
        endpoint = list(instances['bucket'])[0]
        return 'https://{}.s3.amazonaws.com/surveys'.format(endpoint)
    return None
