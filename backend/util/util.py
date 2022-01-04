import xmltodict
import json
from lxml import etree


def readxml(xml_path: str):
    with open(xml_path) as survey:
        encoding = etree.parse(survey)
        encoding = encoding.docinfo.encoding
    with open(xml_path) as survey:
        survey = xmltodict.parse(survey.read(),
                                 encoding=encoding,
                                 attr_prefix='',
                                 cdata_key='text',
                                 force_list={
                                     'questionGroup', 'question', 'option',
                                     'level', 'altText'
                                 })
        survey = json.dumps(survey).replace('"true"', 'true').replace(
            '"false"', 'false').replace('"answer-value"', '"answerValue"')
        survey = json.loads(survey)
        response = survey['survey']
    return response
