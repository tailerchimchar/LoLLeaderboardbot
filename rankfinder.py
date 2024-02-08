from bs4 import BeautifulSoup
import urllib3

"""
        Parameters
        ----------
        server : str
            The server abreviation as used in the op gg url -> "euw", "na", "kr" etc.
        username : str
            The username and the Riot tag seperated by a "-" -> "your_name-Riot_tag"
"""
def retrieve_rank(server, username):
    
    url = f"https://www.op.gg/summoners/{server.lower()}/{username}"
    http = urllib3.PoolManager()
    response = http.request('GET', url, decode_content=True)
    reply = response.data

    soup = BeautifulSoup(reply, 'html.parser')
    tier = soup.find("div", {"class": "tier"}).contents[0]
    lp = soup.find("div", {"class": "lp"}).contents[0]
    #wins = soup.find("div", {"class": "wins"}).contents[0]
    
    print(username)
    print(tier)
    print(f"{lp} lp")

# example usage
retrieve_rank('na', 'Pobelter-NA1')
print()

retrieve_rank('na', 'issariu-NA1')
print()

retrieve_rank('na', 'Kraymos-NA1')
# retrieve_rank('kr', 'Hide on Bush-KR1')