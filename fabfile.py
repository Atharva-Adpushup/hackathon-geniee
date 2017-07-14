from fabric.operations import local as lrun
from fabric.api import *
from fabric.context_managers import lcd
from fabric.state import env

env.hosts = ['localhost']

def build():
	path = "./"
	jsPath = path + "services/genieeAdSyncService/genieeAp/"
	editorPath = path + "Editor/"
	assetsPath = path + "public/assets/"

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
