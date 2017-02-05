from fabric.operations import local as lrun
from fabric.api import *
from fabric.context_managers import lcd
from fabric.state import env

def localhost():
	env.hosts = ['localhost']


def deployApp():
	path = "./"
	jsPath = path + "/services/genieeAdSyncService/genieeAp/"
	editorPath = path + "/Editor/"

	with lcd(path):
		lrun('npm install')
		lrun('git stash')
		lrun('git pull')
		lrun('git stash pop')
		lrun('grunt')

	with lcd(jsPath):
		lrun('npm install')
		lrun('webpack')

	with lcd(editorPath):
		lrun('npm install')
		lrun('webpack')
