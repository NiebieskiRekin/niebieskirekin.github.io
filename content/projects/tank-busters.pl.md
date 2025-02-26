+++
title = 'Tank Busters'
date = 2024-12-15
tags = ["Cpp", "Linux", "Unix sockets", 'Terraform', 'Ansible', 'Google Cloud Platform']
categories = ["Linux", "Networking", 'DevOps', "Studia"]
+++

Gra online multiplayer dla 2-4 graczy jako przeróbka gry 2D asteroids, której celem jest wyeliminowanie pozostałych graczy w szybkiej, chaotycznej rozgrywce. Gracze mogą poruszać się po niewielkiej planszy, strzelać do siebie pociskami i unikać lub niszczyć nadlatujące asteroidy. Projekt podzielony jest na klienta i serwer, które to procesy komunikują się za sobą po TCP za pomocą POSIX sockets przekazując sobie wiadomości zakodowane w BSON. Cały projekt napisany jest w C++ i korzysta z CMake jako build systemu oraz bibliotek: raylib i nlohmann/json. Jednym z ciekawszych aspektów programu, poza samą rozgrywką, jest implementacja współbieżności obsługi klientów i pokoi na serwerze. Odbywa się ona poprzez linuxowy system epoll oraz dedykowane wątki dla klientów, które komunikują się ze sobą za pomocą synchronizowanych systemem eventfd kolejek zawierających wyrażenia funkcyjne (lambdy).

Do projektu napisane zostały też skrypty IaC w Terraform i Ansible, które służą do deploymentu na Google Cloud Compute Instance. Pomogły one przetestować projekt w sieciach rozległych. Skrypt Ansible tworzy także zadanie monitorujące żywotność serwera z użyciem systemd i ntfy.sh.

## Gra

![Main Menu](tank-busters-menu.png)

![Tank busters game](tank-busters-game.png)

## Opis gry

Gra Tank Busters (nasza własna przeróbka gry asteroids PvPvE dla 2-4 graczy)

Klient po uruchomieniu gry wybiera jeden z dostępnych pokoi:

- Rozgrywka jest już w toku - gracz dołącza jako obserwator i czeka do końca danej rudy.
- Gdy runda się zakończy - serwer zaprasza wszystkich graczy w pokoju do nowej rundy
- Rozgrywka jeszcze nie wystartowała - gracz dołącza do lobby, jeżeli w pokoju jest przynajmniej 2 gotowych graczy, to rozgrywka wystartuje automatycznie po upływie danego czasu. Jeżeli gracz nie zdąży zgłosić swojej gotowości to staje się obserwatorem.

Gracz może zdecydować się opuścić dany pokój przed rozpoczęciem gry i wrócić do wyboru dostępnych pokoi.
Your main branch isn't protectedProtect this branch from force pushing or deletio
Przebieg rozgrywki: Serwer rozgłasza rozpoczęcie nowej rozgrywki i rozpoczyna nową rundę. Po rozpoczęciu rundy serwer wymienia informacje z klientami o obiektach (graczach oraz “asteroidach”) znajdujących się na mapie gry.

Jeżeli dany obiekt zostanie trafiony to serwer rozgłasza informacje do wszystkich graczy o zniszczeniu tego obiektu. W przypadku, kiedy to dany gracz zostanie trafiony, zmienia on swoją rolę na obserwującego.

Rozgrywkę wygrywa gracz, który jako ostatni pozostanie przy życiu (nie zostanie trafiony żadnym pociskiem ani asteroidą). Pojawia się krótkie podsumowanie rundy (kto wygrał daną rozgrywkę). Następnie serwer restartuje pokój (ponownie czeka, aż przynajmniej 2 graczy zgłosi gotowość, aby rozpocząć odliczanie do nowej rundy).

Interakcja między graczami: Gracze mogą się poruszać, strzelać pociskami, niszczyć “asteroidy”, innych graczy lub być sami zniszczeni przez innych graczy.

## Repository

<https://github.com/KamieniarzJakub/TankBusters>
