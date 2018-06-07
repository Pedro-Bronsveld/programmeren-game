import bpy

def setupScenes():
    #setup settings for every scene.

    scenes = bpy.data.scenes

    for scene in scenes:
        #set units to centimeters:
        scene.unit_settings.system = 'METRIC'
        scene.unit_settings.scale_length = 0.01

        #set gamma to none:
        scene.display_settings.display_device = 'None'

        #set decay or light falloff for scene in custom property:
        scene['light_decay'] = 2

        #set world:
        if scene.world is None:
            scene.world = bpy.data.worlds[0]

        #set fps to 60:
        scene.render.fps = 60

    #set up worlds:
    #for world in bpy.data.worlds:
    #    world.light_settings.use_environment_light = True

    #setup cast shadow booleans:
    bpy.types.Mesh.cast_shadow = bpy.props.BoolProperty(
        name="Cast Shadow",
        description="Mesh casts shadow."
    )

    #setup receive shadow booleans:
    bpy.types.Mesh.receive_shadow = bpy.props.BoolProperty(
        name="Receive Shadow",
        description="Mesh receives shadow."
    )




    #setup panel:

    class ShadowPanel(bpy.types.Panel):
        """Creates a Panel in the Object properties window"""
        bl_label = "Mesh Shadow"
        bl_idname = "OBJECT_PT_mesh_shadow"
        bl_space_type = 'PROPERTIES'
        bl_region_type = 'WINDOW'
        bl_context = "data"

        def draw(self, context):
            obj = context.object
            if obj.type == "MESH":
                layout = self.layout

                row = layout.row()
                row.prop(obj.data, "cast_shadow", text="Cast Shadow")

                row = layout.row()
                row.prop(obj.data, "receive_shadow", text="Receive Shadow")


    def register():
        bpy.utils.register_class(ShadowPanel)


    def unregister():
        bpy.utils.unregister_class(ShadowPanel)


    #if __name__ == "__main__":
        #create property for scene:

    register()

setupScenes()