# Description of the changes

- Added some message explaining what is the PR about

# Note to reviewer

- `configs/config.sample.js`
  If there is a change in configuration, please make sure that the respective config is updated in the jenkins before merging the PR.
- Please make sure `pm2-process.json` is updated,
    - When deploying a new service
    - When re-deploying an inactive service

# Checklist

- [ ] Tested thoroughly on Local setup
- [ ] Tested thoroughly on Staging setup
- [ ] Rebased the PR on latest origin branch
- [ ] Updated package.json
- [ ] Raised PR against develop (applicable only if hotfix or release)
- [ ] Created Notion Card/JIRA Task
- [ ] Added logging for analysis or error tracking
- [ ] Documentation added

# Additional Information

- Add any additional information if required

# Screenshots of the changes

|        Description         |        Original         |        Updated         |
| :------------------------: | :---------------------: | :--------------------: |
| **Screenshot Description** | **Original Screenshot** | **Updated Screenshot** |
