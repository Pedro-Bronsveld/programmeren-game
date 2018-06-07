import os
import json
import shutil
import bpy

def export(obj, export_models_dir):
    #get mesh name:
    name = obj.data.name

    print('exporting: ' + name)

    #export directory:
    export_dir = export_models_dir + '/' + name + '/'
    #create dir if it doesn't exist:
    if not os.path.isdir(export_dir):
        os.makedirs(export_dir)

    #if the object has a parent object its transformations need to be cleared:
    #first find the parent object that needs to be moved:
    move_object = obj
    while move_object.parent != None:
        move_object = move_object.parent

    #reset remove location, rotation and scale:
    #save the original transformations first:
    transforms = {
        'location':{
            'x': move_object.location.x,
            'y': move_object.location.y,
            'z': move_object.location.z
        },
        'rotation':{
            'x': move_object.rotation_euler.x,
            'y': move_object.rotation_euler.y,
            'z': move_object.rotation_euler.z
        },
        'scale':{
            'x': move_object.scale.x,
            'y': move_object.scale.y,
            'z': move_object.scale.z
        }
    }
    #set transforms to export state:
    move_object.location.x = 0
    move_object.location.y = 0
    move_object.location.z = 0
    move_object.rotation_euler.x = 0
    move_object.rotation_euler.y = 0
    move_object.rotation_euler.z = 0
    move_object.scale.x = 1
    move_object.scale.y = 1
    move_object.scale.z = 1

    #switch to correct scene:
    bpy.context.screen.scene = obj.users_scene[0]
    #select target object for export:
    obj.select = True
    bpy.context.scene.objects.active = obj

    
    #export to json:
    bpy.ops.export.three(
        filepath = export_dir + 'model.json',
        option_vertices = True,
        option_faces = True,
        option_normals = True,
        option_colors = False,
        option_mix_colors = False,
        option_uv_coords = True,
        option_materials = False,
        option_face_materials = True,
        option_maps = True,
        option_skinning = True,
        option_bones = True,
        option_extra_vgroups = '',
        option_apply_modifiers = True,
        option_index_type = 'Uint16Array',
        option_scale = 1.0,
        option_round_off = False,
        option_round_value = 6,
        option_custom_properties = False,
        option_logging = 'disabled',
        option_geometry_type = 'geometry',
        option_export_scene = False,
        option_embed_animation = True,
        option_export_textures = True,
        option_embed_textures = True,
        option_texture_folder = '',
        option_lights = False,
        option_cameras = False,
        option_hierarchy = False,
        option_animation_morph = False,
        option_blend_shape = False,
        option_animation_skeletal = 'pose',
        option_keyframes = True,
        option_bake_keyframes = False,
        option_frame_index_as_time = False,
        option_frame_step = 1,
        option_indent = True,
        option_compression = 'None',
        option_influences = 2
    )

    #deselect all objects in the scene:
    bpy.ops.object.select_all(action="DESELECT")

    #re-apply transformations:
    move_object.location.x = transforms['location']['x']
    move_object.location.y = transforms['location']['y']
    move_object.location.z = transforms['location']['z']
    move_object.rotation_euler.x = transforms['rotation']['x']
    move_object.rotation_euler.y = transforms['rotation']['y']
    move_object.rotation_euler.z = transforms['rotation']['z']
    move_object.scale.x = transforms['scale']['x']
    move_object.scale.y = transforms['scale']['y']
    move_object.scale.z = transforms['scale']['z']

    #export extra properties of mesh to seperate json file:
    model_props = {
        'cast_shadow': obj.data.cast_shadow,
        'receive_shadow': obj.data.receive_shadow
    }

    model_props_file = open(export_dir + '/modelProps.json', "w")
    model_props_file.write( json.dumps(model_props) )
    model_props_file.close()

    #copy texture images if the object has any:
    #loop through all materials on the object:
    materials = obj.data.materials
    for material in materials:
        #loop through texture slots of material:
        material.texture_slots
        for texture_slot in material.texture_slots:
            #check if texture slot is used:
            if texture_slot is not None:
                #get the texture:
                texture = bpy.data.textures[texture_slot.name]
                #check if texture has image:
                if(texture.type == 'IMAGE' and texture.image is not None):
                    #copy file to exported model's directory:
                    image_path = bpy.path.abspath( texture.image.filepath )
                    shutil.copy2(image_path, export_dir)

    print("exported " + obj.data.name)

