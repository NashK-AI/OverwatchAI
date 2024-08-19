
#  Heroes Team Builder Overwatch AI

![Heroes team Builder Overwatch AI](https://heroesteambuilder.com/static/title.png)

Heroes Team Builder is an innovative artificial intelligence (AI) tool designed to suggest the most suitable champions based on the opposing team and the allied team.
Unlike other similar tools that rely on traditional algorithms, Heroes Team Builder harnesses the power of artificial intelligence to offer more precise and tailored suggestions.

What kind of data is used?

The artificial intelligence (AI) analyzes the data provided by the game, patches and suggest optimal champions. The AI relies on structured and factual data, trained from real in-game situations.

Each hero has measurable effectiveness against or with every other hero, based on concrete facts and real situations.

Example:

Genji can deflect Cassidy's grenades, shots, and ultimate, making him a potential strategic choice against him.

or Zarya's shield to protect Phara when she uses her ultimate


## Attention
**The AI data in this source code is not official. This code is only intended for the following environment:** [https://heroesteambuilder.com/dev](https://heroesteambuilder.com/dev)

The official website is accessible here: [https://heroesteambuilder.com](https://heroesteambuilder.com)

## Setup
To set up and run this project, follow these steps:

1. **Clone the repos**

   ```git clone https://github.com/NashK-AI/OverwatchAI.git  ```


2. **Create a Python virtual environment**

    python -m venv env

3. **Activate the virtual environment:**
    
On Windows

    .\env\Scripts\activate

or Linux

    source env/bin/activate

4. **Install the necessary dependencies**

    pip install -r requirements.txt

5. Start the project

    python app.py



## Tech Stack

**Client:** HTML, CSS, JavaScript

**Server:** Flask


## Contributing & Deployment

If you wish to contribute to the project and share your work, you have the possibility at any time to deploy your source code directly on the website https://heroesteambuilder.com/dev/.

To do that you have to [fork](https://github.com/NashK-AI/OverwatchAI/fork) the source code, make modifications, and submit a pull request. 

After the pull request is done you can do a self-approval of your pull request to automatically deploy the changes. 
To do so, you will need access to our Discord via this link https://discord.gg/RRB33Bp8 to request access. Depending on certain criteria defined on Discord, you may be granted specific permissions that will give you the ability to:

=> ***Create your own branche***

=> ***Approve your merge request***

=> ***Deploy to the development environment whenever you wish***

CI-CD:
    create-branch
    pull-request
    run-deploy

#### Don't modify this code for the deployment

```python
ENV = os.getenv('FLASK_ENV', 'dev')
@app.context_processor
def inject_stage():
    if ENV == 'dev':
        return dict(stage='dev')
    else:
        return dict(stage='')
```


## Feedback

If you have any feedback like proposing a new functionality or giving feedback about the quality of the data from the [official website](https://heroesteambuilder.com/)), please reach out to us in [Discord](https://discord.gg/RRB33Bp8)


## Support

For support: [Discord](https://discord.gg/RRB33Bp8)


## About Us
Follow us on:

[Discord](https://discord.gg/RRB33Bp8)

[Twitter](https://x.com/NashK_AI)

## License

This project is an unofficial tool for Overwatch 2, a game developed by Blizzard Entertainment. The images and names used in this project are the property of Blizzard Entertainment. However, all other aspects of this project, including the source code, are my property, and I am solely responsible for them.

This project is not associated with or endorsed by Blizzard Entertainment.

The source code shared in this repository is for educational and development purposes related to this project only.
