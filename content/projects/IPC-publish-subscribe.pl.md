+++
title = 'IPC Publish Subscribe'
date = 2024-01-03
tags = ["C", "Cmake", "Linux", 'IPC']
categories = ["Studia", "Linux"]
+++

Projekt zaliczeniowy - Programowanie Systemowe i Współbieżne.

Celem projektu jest implementacja systemu przekazywania (rozgłaszania) wiadomości do wszystkich procesów, które zasubskrybowały dany typ wiadomości (zarejestrowały się na ich odbiór). Aplikacja wykorzystuje mechanizm kolejek komunikatów (Message Queues). Projekt zawiera w sobie 2 podprogramy: klienta i serwera. Każdy klient może wysyłać i otrzymywać wiadomości do/od pozostałych użytkowników systemu. W wymianie wiadomości pomiędzy klientami zawsze pośredniczy serwer. Otrzymywane wiadomości wyświetlane są na ekranie.

Programy są zaimplementowane zgodnie ze specyfikacją opisaną w protokole
<https://github.com/NiebieskiRekin/IPC-Publish-Subscribe/blob/main/PROTOCOL.md>

Użyty build system to Cmake. Skonfigurowałem też debugger do VScode.

# Repository

<https://github.com/NiebieskiRekin/IPC-Publish-Subscribe>
