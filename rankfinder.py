from bs4 import BeautifulSoup
import urllib3
import sys
import re






USERNAME = sys.argv[1]
SERVER = sys.argv[2]
OFFICIAL_SERVER = sys.argv[3]
print(USERNAME)
print(SERVER)
print(OFFICIAL_SERVER)


"""
        Parameters
        ----------
        server : str
            The server abreviation as used in the op gg url -> "euw", "na", "kr" etc.
        username : str
            The username and the Riot tag seperated by a "-" -> "your_name-Riot_tag"
"""
def retrieve_rank(server, username,OFFICIAL_SERVER):
    
    url = f"https://www.op.gg/summoners/{OFFICIAL_SERVER}/{username}-{server.lower()}"
    print("url is: " + url)
    http = urllib3.PoolManager()
    response = http.request('GET', url, decode_content=True)
    reply = response.data

    soup = BeautifulSoup(reply, 'html.parser')
    tier_div = soup.find("div", {"class": "tier"})
    win = soup.find("div", {"class": "win-lose"}).text
    win_lose_parts = win.split()

    wins = int(win_lose_parts[0][:-1])
    losses = int(win_lose_parts[1][:-1])
    
    total_games = wins + losses
    winrate = (wins / total_games * 100) if total_games > 0 else 0

    contents = tier_div.contents
    lp = soup.find("div", {"class": "lp"}).contents[0]
    #wins = soup.find("div", {"class": "wins"}).contents[0]
    
    div_lp = ""

    for content in contents:
        if isinstance(content, str) and content != " ":
            div_lp += content

    print(USERNAME)
    print(div_lp)
    print(f"{lp} lp")
    try:
      print("win/loss")
      print(win)
      print(wins)
      print(losses)
      print("this is the server output: " + OFFICIAL_SERVER)

    except:
      print("wins doesn't work")

    return {
        'IGN': USERNAME,
        'Rank': div_lp,
        'LP': lp,
        'Wins': wins,
        'Losses': losses,
        'Winrate': "{:.2f}%".format(winrate)
    }

rank = retrieve_rank(SERVER,USERNAME,OFFICIAL_SERVER)

print(rank)
# example usage
#test = retrieve_rank('na', 'Blonde-Blue')
#print('justin sucks')
#print(test)
#print()
#retrieve_rank('na', 'issariu-NA1')
#print()

#retrieve_rank('na', 'Kraymos-NA1')
#print()

#retrieve_rank('na', 'poisonberri')
#print()

#retrieve_rank('na', 'december 31 1999-65936')
#print()

# retrieve_rank('kr', 'Hide on Bush-KR1')