from os import environ, path


class Dev:
    def __init__(self):
        self.status = "DEV" in environ

    def get_cached(self, file):
        if self.status:
            return False
        if not path.exists(file):
            return False
        return file
