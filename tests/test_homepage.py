import unittest
from flask_testing import TestCase
from app import app
from flask import session
from boggle import Boggle


class Test_homepage(TestCase):
    def create_app(self):
        return app

    def test_load(self):
        response = self.client.get("/")
        self.assert200(response)

    def test_template(self):
        response = self.client.get("/")
        self.assertTemplateUsed("homepage.html")

    def test_board_loaded(self):
        response = self.client.get("/")
        self.assertIn(b"<button type=\"submit\">Generate</button>", response.data)