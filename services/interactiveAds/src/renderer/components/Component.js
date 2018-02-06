// Top-level component

import commonConsts from '../../commonConsts';
const $ = window.adpushup.$ || window.$;

class Component {
    render() {
        const { formatData, width, height } = this.interactiveAd;
        let css = { width, height }, format = $('<div />');

        switch(formatData.type) {
            case commonConsts.FORMATS.STICKY.NAME:
                format.css({ 
                    ...css, 
                    ...commonConsts.FORMATS.STICKY.BASE_STYLES, 
                    ...this.getPlacementCSS(formatData)
                });
                return this.parentNode.append(format.append(this.adCode));
        }
    }
}

export default Component;