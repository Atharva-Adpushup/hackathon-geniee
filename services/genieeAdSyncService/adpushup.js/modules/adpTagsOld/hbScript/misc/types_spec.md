## AdPushup header bidding types spec

### Browser Supported
#### Type 1: Prebid rendered
* Bidder config: yes
* DFP slot: yes
* Bidding: yes
* DFP targeting: yes
		
#### Type 2: Postbid rendered 
* Bidder config: yes
* DFP slot: no
* Bidding: yes
* DFP targeting: no
		
#### Type 3: No bid from postbid
* Bidder config: yes
* DFP slot: no
* Bidding: yes (but no bid from postbid or timed out)
* DFP targeting: no
		
#### Type 4: No bidder config, render ADX
* Bidder config: no
* DFP slot: yes
* Bidding: no
* DFP targeting: yes
	
#### Type 5: No bidder config or dfp slot present, collapsing div
* Bidder config: no
* DFP slot: no
* Bidding: no
* DFP targeting: no
		
### Browser Not Supported
		
#### Type 6: DFP slot present, render ADX
* Bidder config: N/A
* DFP slot: yes
* Bidding: N/A
* DFP targeting: yes
		
#### Type 7: No DFP slot present, collapsing div
* Bidder config: N/A
* DFP slot: no
* Bidding: N/A
* DFP targeting: no

#### Type 9: User disabled header bidding for that slot using defineSlot (can be done via editor)
* Bidder config: N/A
* DFP slot: yes
* Bidding: N/A
* DFP targeting: no
		