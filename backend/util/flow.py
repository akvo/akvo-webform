import requests as r

instance_base = 'https://api-auth0.akvo.org/flow/orgs/'


def get_headers(token: str):
    login = {
        'client_id': 'S6Pm0WF4LHONRPRKjepPXZoX1muXm1JS',
        'grant_type': 'refresh_token',
        'refresh_token': token,
        'scope': 'openid email'
    }
    req = r.post("https://akvofoundation.eu.auth0.com/oauth/token", data=login)
    if req.status_code != 200:
        return False
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.akvo.flow.v2+json',
        'Authorization': 'Bearer {}'.format(req.json().get('id_token'))
    }


def get_data(uri, auth):
    return r.get(uri, headers=auth).json()


def fetch_all(url, headers, formInstances=[]):
    data = get_data(url, headers)
    next_url = data.get('nextPageUrl')
    data = data.get('formInstances')
    for d in data:
        formInstances.append(d)
    if next_url:
        fetch_all(next_url, headers, formInstances)
    return formInstances


def data_handler(data, qType):
    if data:
        if qType in [
                'FREE_TEXT', 'NUMBER', 'BARCODE', 'DATE', 'GEOSHAPE', 'SCAN',
                'CADDISFLY'
        ]:
            return data
        if qType == 'OPTION':
            return handle_list(data, "text")
        if qType == ['CASCADE']:
            return handle_list(data, "name")
        if qType == ['PHOTO', 'VIDEO']:
            return data.get('filename')
        if qType == 'VIDEO':
            return data.get('filename')
        if qType == 'GEO':
            return {'lat': data.get('lat'), 'long': data.get('long')}
        if qType == 'SIGNATURE':
            return data.get("name")
    return None


def handle_list(data, target):
    response = []
    for value in data:
        if value.get("code"):
            response.append("{}:{}".format(value.get("code"),
                                           value.get(target)))
        else:
            response.append(value.get(target))
    return "|".join(response)


def get_page(instance: str, survey_id: int, form_id: int, token: str):
    headers = get_headers(token)
    instance_uri = '{}{}'.format(instance_base, instance)
    form_instance_url = '{}/form_instances?survey_id={}&form_id={}'.format(
        instance_uri, survey_id, form_id)
    collections = fetch_all(form_instance_url, headers)
    form_definition = get_data('{}/surveys/{}'.format(instance_uri, survey_id),
                               headers)
    form_definition = form_definition.get('forms')
    form_definition = list(
        filter(lambda x: int(x['id']) == form_id,
               form_definition))[0].get('questionGroups')
    results = []
    for col in collections:
        dt = {}
        for c in col:
            if c != 'responses':
                dt.update({c: col[c]})
            else:
                for g in form_definition:
                    answers = col[c][g['id']]
                    for q in g['questions']:
                        d = data_handler(answers[0].get(q['id']), q['type'])
                        n = "{}|{}".format(q['id'], q['name'])
                        dt.update({n: d})
        results.append(dt)
    return results
