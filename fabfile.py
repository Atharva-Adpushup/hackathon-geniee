from fabric.operations import local as lrun
from fabric.api import *
from fabric.context_managers import lcd
from fabric.state import env
from fabric.contrib import files
import os 

env.hosts = ['localhost']

path = "./"
jsPath = path + "services/genieeAdSyncService/genieeAp/"
editorPath = path + "Editor/"
adpTagsPath = path+"/services/adpTags/"
prebidPath = adpTagsPath+"Prebid.js"
assetsPath = path + "public/assets/"
prebidGitPath = "https://github.com/adpushup/Prebid.js"

def buildAdpTags():
	with lcd(adpTagsPath):
		lrun("npm install")
		lrun("webpack --progress")

def build():
	if os.path.isdir(prebidPath):
		buildAdpTags()
	else:
		with lcd(adpTagsPath):
			lrun("git clone "+prebidGitPath)
		with lcd(prebidPath):
			lrun("npm install")
			lrun("node_modules/.bin/gulp build --adapters adapter2.json")
		buildAdpTags()
		
	with lcd(path):
		lrun('echo "/******************** Building root files ********************/"')
		lrun('npm install')
		lrun('git stash')
		lrun('git pull')
		lrun('git stash pop')
		lrun('grunt')
	
	with lcd(assetsPath):
		lrun('echo "/******************** Building public assets files ********************/"')
		lrun('npm install')
		lrun('webpack')

	with lcd(jsPath):
		lrun('echo "/******************** Building Geniee ad sync service files ********************/"')
		lrun('npm install')
		lrun('webpack')

	with lcd(editorPath):
		lrun('echo "/******************** Building Visual Editor files ********************/"')
		lrun('npm install')
		lrun('webpack')
