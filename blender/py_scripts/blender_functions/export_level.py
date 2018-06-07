import os
import json
import bpy
from blender_functions import export_model

def export(export_levels_dir, export_models_dir, meshes_list):
    #meshes that have been exported:
    exported = {}

    scene = bpy.context.scene

    name = scene.name

    export_dir = export_levels_dir

    #create dir if it doesn't exist:
    if not os.path.isdir(export_dir):
        os.makedirs(export_dir)
    
    #export data for the level:
    level = {
        'name': scene.name,
        'objects': {},
        'environment_light': scene.world.light_settings.environment_energy,
        'horizon_color': {
            'r': round(scene.world.horizon_color.r * 255),
            'g': round(scene.world.horizon_color.g * 255),
            'b': round(scene.world.horizon_color.b * 255)
        }
    }
    
    print("Starting level export.")

    scene_objects = scene.objects
    
    #loop through all objects in the scene:
    for scene_object in scene_objects:
        
        if scene_object.type == 'MESH' or scene_object.type == 'LAMP':
            levelObj = {
                'name': scene_object.name,
                'model': scene_object.data.name,
                'type': scene_object.type,
                'location': {
                    'x': scene_object.location.x,
                    'y': scene_object.location.z,
                    'z': scene_object.location.y * -1
                },
                'rotation': {
                    'x': scene_object.rotation_euler.x,
                    'y': scene_object.rotation_euler.z,
                    'z': scene_object.rotation_euler.y * -1
                },
                'scale': {
                    'x': scene_object.scale.x,
                    'y': scene_object.scale.z,
                    'z': scene_object.scale.y
                }
            }

            if scene_object.type == 'LAMP':
                #light data:                
                levelObj['data'] = {
                    'type': scene_object.data.type,
                    'color': {
                        'r': round(scene_object.data.color.r * 255),
                        'g': round(scene_object.data.color.g * 255),
                        'b': round(scene_object.data.color.b * 255)
                    },
                    'energy': scene_object.data.energy,
                    'distance': scene_object.data.distance,
                    'decay': scene['light_decay'],
                    'spot_size': 0,
                    'spot_blend': 0,
                    'cast_shadow': False,
                }
                if scene_object.data.type == 'SPOT':
                    levelObj['data']['spot_size'] = scene_object.data.spot_size
                    levelObj['data']['spot_blend'] = scene_object.data.spot_blend
                if scene_object.data.type != 'HEMI' and scene_object.data.shadow_method == 'RAY_SHADOW':
                    levelObj['data']['cast_shadow'] = True
                
            level['objects'][scene_object.name] = levelObj
        
        #export the mesh if it's not linked from another file:
        if scene_object.type == 'MESH' and scene_object.data.name in meshes_list:
            #check if exported object already contains the mesh:
            try:
                exported[scene_object.data.name]
                #mesh already exported
            except:
                #add mesh to export object
                exported[scene_object.data.name] = scene_object.data
                
                #export object:
                export_model.export(scene_object, export_models_dir)

    #encode level object to json:
    levelJson = json.dumps(level)
    #export level json data:
    levelFile = open(export_dir + '/' + level['name'] + '.json', "w")
    levelFile.write(levelJson)
    levelFile.close()

    #clean up meshes without users:
    all_meshes = bpy.data.meshes
    for mesh in all_meshes:
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
    #clean up materials without users:
    all_materials = bpy.data.materials
    for material in all_materials:
        if material.users == 0:
            bpy.data.materials.remove(material)

    return name
