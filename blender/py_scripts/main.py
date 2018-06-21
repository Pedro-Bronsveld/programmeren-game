import os
import sys
import bpy, addon_utils
import json

#add path of this file's directory to the path in order to import modules:
#script_dir = os.path.dirname(os.path.realpath(__file__))
this_file = bpy.data.filepath
script_dir = os.path.dirname(this_file)
if not script_dir in sys.path:
    sys.path.append(script_dir)

from blender_functions import blend_files
from blender_functions import export_model
from blender_functions import export_level
from blender_functions import setup

#setup directory paths:
root_dir = script_dir + "/../.."
blender_dir = script_dir + "/.."
models_dir = blender_dir + "/models"
levels_dir = blender_dir + "/levels"
assets_dir = root_dir + "/docs/assets"
export_models_dir = assets_dir + "/models"
export_levels_dir = assets_dir + "/levels"
sounds_dir = assets_dir + "/sounds"

#enable three exporter:
addon_utils.enable(module_name="io_three")

#get all blend files of models and levels:
model_files = blend_files.listBlendFiles(models_dir)
level_files = blend_files.listBlendFiles(levels_dir)
all_files = model_files + level_files

#array with exported level names:
levels_list = []

#function to append the file and export objects inside:
def export(file_name, is_level):
    with bpy.data.libraries.load(file_name) as (data_from, data_to):
        #get list of meshes in blend file:
        meshes_list = data_from.meshes
        #get list of actions in blend file:
        actions_list = data_from.actions
        #get scenes in blend file:
        sceneNames = data_from.scenes

    #loop through scenes:
    for sceneName in sceneNames:
        #setup scene:
        bpy.ops.world.new()
        setup.setupScenes()  
        #append scene:
        bpy.ops.wm.append( directory=file_name + "/Scene", filename=sceneName  )
        #append actions:
        for action in actions_list:
            bpy.ops.wm.append( directory=file_name + "/Action", filename=action  )
        #switch to the scene:
        scene = bpy.data.scenes[sceneName]
        bpy.context.screen.scene = scene
        

        if is_level:
            #export level:
            levels_list.append( export_level.export(export_levels_dir, export_models_dir, meshes_list) )
        else:
            #export models:
            #get objects in the scene
            scene_objects = scene.objects
            for scene_object in scene_objects:
                if scene_object.type == "MESH":
                    #export model:
                    export_model.export(scene_object, export_models_dir)

        #remove scene after exporting:
        bpy.data.scenes.remove(scene, True)

        def removeData(data_list):
            for data in data_list:
                data_list.remove(data, True)
        #remove all data:
        d = bpy.data
        remove_list = [
        d.objects,
        d.meshes,
        d.materials,
        d.worlds,
        d.actions,
        d.textures,
        d.armatures,
        d.cameras,
        d.groups,
        d.images,
        d.lamps,
        d.masks,
        d.particles
        ]
        for item in remove_list:
            removeData(item)     

#loop through model files:
for model_file in model_files:
    export(model_file, False)

#loop through level files:
for level_file in level_files:
    export(level_file, True)

#get all model names:
for directory in os.walk(export_models_dir):
    models_list = directory[1] 
    break

#get all sounds names:
sounds_list = []
for root, dirs, files in os.walk(sounds_dir):
    for filename in files:
        sounds_list.append(filename)

#structure preload data:
preload_data = {
    "models" : models_list,
    "levels" : levels_list,
    "sounds" : sounds_list
}

#write list of models and levels to json file:
preload_file = open(assets_dir + "/preload_list.json","w") 
preload_file.write( json.dumps(preload_data) )
preload_file.close() 

print("Export script complete.")
