import os
import bpy
from blender_functions import setup

#list all blend files in given directory and sub directories:
def listBlendFiles(given_dir):
    blend_files = []
    for root, dirs, files in os.walk(given_dir, topdown=True):
        for name in files:
            if name.endswith(".blend"):
                blend_files.append( os.path.join(root, name) )
    return blend_files

#open blend file:
def openBlend(filepath):
    #open the blend file:
    bpy.ops.wm.open_mainfile(filepath=filepath)