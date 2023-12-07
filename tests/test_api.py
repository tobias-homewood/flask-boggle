import unittest
from flask_testing import TestCase
from app import app
from flask import session
from boggle import Boggle
import json


class Test_api(TestCase):
    def create_app(self):
        return app

    def test_new_board(self):
        response = self.client.get("new_board/5")
        self.assert200(response)
        self.assertIn("board", response.data.decode("utf-8"))
