+++
title = 'Baza Danych Policja'
date = 2024-10-21
tags = ["OracleDB", "Oracle Apex", "SQL", "Python"]
categories = ["Studia"]
+++

Aplikacja na projekt zaliczeniowy z 'Zarządzanie bazami danych SQL i NoSQL'.
Aplikacja napisana w Oracle Apex (wymaganie prowadzącego) modelująca wydział ruchu drogowego policji.
Założeniem projektu było zamodelowanie wybranej rzeczywistości najpierw jako diagram encji, a potem ręczne przekształcenie go do postaci relacyjnej bazy danych (SQL DDL).
Następnie należało napisać aplikację dla naiwnego użytkownika zachowując pełną poprawność przetwarzania danych

<https://github.com/NiebieskiRekin/DB-Drogowka>

Repozytorium zawiera całkiem sporo SQL do tworzenia tabel, procedur, wyzwalaczy i perspektyw.
Ponadto utworzyłem też skrypt w Pythonie do generowanie przykładowych danych do aplikacji z użyciem biblioteki Faker.


## Diagram encji

Encje:

- Ubezpieczenie,
- Pojazd,
- Prawo jazdy,
- Osoba:
  - Obywatel,
  - Funkcjonariusz,
- Mandat,
- Zdarzenie,
- Interwencja,
- Forma wymiaru kary:
  - Mandat
  - Aresztowanie
  - Pouczenie
- Wykroczenie

![Diagram encji](https://github.com/NiebieskiRekin/DB-Drogowka/blob/master/LogicalDiagram_JakubKamieniarz155845_TomaszPaw%C5%82owski155965.png?raw=true)

## Diagram relacji

![Diagram relacji](https://github.com/NiebieskiRekin/DB-Drogowka/blob/master/RelationalDiagram_JakubKamieniarz155845_TomaszPaw%C5%82owski155965.png?raw=true)
