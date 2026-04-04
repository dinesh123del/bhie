from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
import joblib
# import od  # Placeholder for outlier detection library
# from od import od
