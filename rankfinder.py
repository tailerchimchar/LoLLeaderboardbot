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
    tier_div = soup.find("div", {"class": "tier"})
    contents = tier_div.contents
    lp = soup.find("div", {"class": "lp"}).contents[0]
    #wins = soup.find("div", {"class": "wins"}).contents[0]
    
    div_lp = ""

    for content in contents:
        if isinstance(content, str) and content != " ":
            div_lp += content

    print(username)
    print(div_lp)
    print(f"{lp} lp")

    return {
        'IGN': username,
        'Rank': div_lp,
        'LP': lp
    }

# example usage
test = retrieve_rank('na', 'Blonde-Blue')
print('justin sucks')
print(test)
print()
retrieve_rank('na', 'issariu-NA1')
print()

retrieve_rank('na', 'Kraymos-NA1')
print()

retrieve_rank('na', 'poisonberri-YAS')
print()

retrieve_rank('na', 'december 31 1999-65936')
print()

# retrieve_rank('kr', 'Hide on Bush-KR1')