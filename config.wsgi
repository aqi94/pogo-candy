#!/usr/bin/python
import sys
import logging
from pathlib import Path
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0, Path(__file__).parent)

from webApp import app as application
application.secret_key = 'TESTKEY123'