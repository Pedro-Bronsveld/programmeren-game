import subprocess

blender = "C:\\Program Files\\Blender Foundation\\Blender\\blender.exe"
script = "main.py"

subprocess.call([blender, "scripts.blend", "-b", "--python", script])

#input("Script complete, press enter to continue.")