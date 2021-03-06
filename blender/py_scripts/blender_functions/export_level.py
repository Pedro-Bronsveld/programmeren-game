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
        },
        'player_start':{
            'x': 0,
            'y': 0,
            'z': 0
        },
        'level_end':{
            'x': 0,
            'y': 0,
            'z': 0,
            'use': False,
            'radius': 0
        },
        'view_rotate': 0
    }
    
    print("Starting level export.")

    scene_objects = scene.objects

    #check if player starting position is set:
    try:
        player_start = scene_objects['player_start']
        level['player_start']['x'] = player_start.location.x
        level['player_start']['y'] = player_start.location.z
        level['player_start']['z'] = player_start.location.y * -1
        level['view_rotate'] = player_start.rotation_euler.z
        
    except:
        print("Player start position not set, 0,0,0 will be used.")

    #check if level end spehere is set:
    try:
        level_end = scene_objects['level_end']
        level['level_end']['x'] = level_end.location.x
        level['level_end']['y'] = level_end.location.z
        level['level_end']['z'] = level_end.location.y * -1
        level['level_end']['use'] = True
        level['level_end']['radius'] = level_end.scale.x

    except:
        print("Level end not set.")
    
    #loop through all objects in the scene:
    for scene_object in scene_objects:
        
        if scene_object.type == 'MESH' or scene_object.type == 'LAMP' or scene_object.type == 'CAMERA':
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
