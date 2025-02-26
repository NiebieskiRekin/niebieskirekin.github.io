+++
title = 'Tank Busters'
date = 2024-12-15
tags = ["Cpp", "Linux", "Unix sockets", 'Terraform', 'Ansible']
categories = ["Linux", "Networking", 'DevOps', "Studia"]
+++

<https://github.com/KamieniarzJakub/TankBusters>

## Screeny

TODO: add images

## Tech stack

TODO: add tech stack description

## Opis gry

Gra Tank Busters (nasza własna przeróbka gry asteroids PvPvE dla 2-4 graczy)

Klient po uruchomieniu gry wybiera jeden z dostępnych pokoi:

- Rozgrywka jest już w toku - gracz dołącza jako obserwator i czeka do końca danej rudy.
- Gdy runda się zakończy - serwer zaprasza wszystkich graczy w pokoju do nowej rundy
- Rozgrywka jeszcze nie wystartowała - gracz dołącza do lobby, jeżeli w pokoju jest przynajmniej 2 gotowych graczy, to rozgrywka wystartuje automatycznie po upływie danego czasu. Jeżeli gracz nie zdąży zgłosić swojej gotowości to staje się obserwatorem.

Gracz może zdecydować się opuścić dany pokój przed rozpoczęciem gry i wrócić do wyboru dostępnych pokoi.

Przebieg rozgrywki: Serwer rozgłasza rozpoczęcie nowej rozgrywki i rozpoczyna nową rundę. Po rozpoczęciu rundy serwer wymienia informacje z klientami o obiektach (graczach oraz “asteroidach”) znajdujących się na mapie gry.

Jeżeli dany obiekt zostanie trafiony to serwer rozgłasza informacje do wszystkich graczy o zniszczeniu tego obiektu. W przypadku, kiedy to dany gracz zostanie trafiony, zmienia on swoją rolę na obserwującego.

Rozgrywkę wygrywa gracz, który jako ostatni pozostanie przy życiu (nie zostanie trafiony żadnym pociskiem ani asteroidą). Pojawia się krótkie podsumowanie rundy (kto wygrał daną rozgrywkę). Następnie serwer restartuje pokój (ponownie czeka, aż przynajmniej 2 graczy zgłosi gotowość, aby rozpocząć odliczanie do nowej rundy).

Interakcja między graczami: Gracze mogą się poruszać, strzelać pociskami, niszczyć “asteroidy”, innych graczy lub być sami zniszczeni przez innych graczy.
