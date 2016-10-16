import { messengerCommands } from 'consts/commonConsts';
import { showMenu } from 'actions/insertMenuActions';
import Messenger from 'libs/messenger';
import * as channelActions from 'actions/channelActions';
import { deleteAd } from 'actions/adActions';
import { deleteSection } from 'actions/sectionActions';


const messenger = new Messenger(),
	getTarget = (channelId) => {
		const channelFrame = document.querySelector(`iframe[data-adpid="iframe${channelId}"]`);
		if (!channelFrame) {
			return false;
		}

		return channelFrame.contentWindow;
	},
	initMessageHandler = ({ dispatch, getState }) => {
		messenger.onMessage.add((cmd, data) => {
			switch (cmd) {
				case messengerCommands.SHOW_INSERT_CONTEXTMENU:
					dispatch(showMenu(data));
					break;

				case messengerCommands.SHOW_EDIT_CONTEXTMENU:
					// uiActions.showContextMenu(components.EDIT_CONTEXTMENU, { menu: components.EDIT_CONTEXTMENU, x: platformPos.left + data.clientX, y: platformPos.top + data.clientY, sectionId: data.sectionId, audienceId: data.audienceId, adSize: data.adSize });
					break;

				case messengerCommands.CM_FRAMELOAD_SUCCESS:
					dispatch(channelActions.openChannelSuccess(data.channelId));
					break;

				case messengerCommands.REMOVE_AD:
					dispatch(deleteAd(data.adId, data.sectionId));
					break;

				case messengerCommands.REMOVE_SECTION:
					dispatch(deleteSection(data.sectionId));
					break;

				case messengerCommands.SECTION_ALL_XPATHS:
					this.flux.actions.updateSection(data);
					break;

				case messengerCommands.SECTION_XPATH_MISSING:
					this.flux.actions.updateSection({ id: data.id, xpathMissing: true });
					break;

				default:
					break;

			}
		});
	},
	sendMessage = (channelId, cmd, data) => {
		const target = getTarget(channelId);
		if (!target) {
			alert('Post message target not found');
			return false;
		}
		messenger.setTarget(target);
		switch (cmd) {
			case 'Hello':

				break;

			default:
				messenger.sendMessage(cmd, data);
				break;
		}
	};


export { initMessageHandler, sendMessage };
