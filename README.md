# OrgaLearn 📚⏱️

O **OrgaLearn** é uma aplicação web desenvolvida como projeto final de curso em Análise e Desenvolvimento de Sistemas na Unisinos, com o objetivo de otimizar a rotina de estudos através da combinação de um cronômetro de foco, sistema de repetição espaçada (SRS), gamificação com ganho de XP e métricas detalhadas de desempenho.

## 🚀 Principais Funcionalidades
- **Estudo Ativo & Cronômetro:** Registo de sessões de estudo por matéria com contagem de tempo progressiva.
- **Repetição Espaçada:** Fila de revisões automáticas baseada no desempenho e notas de facilidade do utilizador.
- **Gamificação:** Sistema de níveis e barras de progresso baseadas em XP conquistado com o tempo de estudo.
- **Histórico & Métricas:** Gráficos interativos e visão consolidada dos conteúdos e disciplinas estudadas.
- **Base de Dados em Tempo Real:** Integração completa com o Firebase Firestore e Firebase Authentication.

## 🛠️ Tecnologias Utilizadas
- **Frontend:** React, Tailwind CSS, Lucide React, Recharts
- **Backend & Auth:** Firebase (Authentication & Cloud Firestore)
- **Ferramentas:** Vite

## ⚙️ Como Executar o Projeto Localmente

1. Clona este repositório:
   ```bash
   git clone https://github.com/SEU_UTILIZADOR/orgalearn.git

2. Entra na pasta do projeto:
    ```bash
    cd orgalearn

3. Instala as dependência:
    ```bash
    npm install

4. Configura as tuas credenciais do Firebase num ficheiro de ambiente (.env) na raiz do projeto coma seguinte estrutura:
    VITE_FIREBASE_API_KEY="sua_api_key"
    VITE_FIREBASE_AUTH_DOMAIN="seu_auth_domain"
    VITE_FIREBASE_PROJECT_ID="seu_project_id"
    VITE_FIREBASE_STORAGE_BUCKET="seu_storage_bucket"
    VITE_FIREBASE_MESSAGING_SENDER_ID="seu_sender_id"
    VITE_FIREBASE_APP_ID="seu_app_id"

5. Inicia o servidor de desenvolvimento:
    ```bash
    npm run dev

## 👩‍💻 Desenvolvida por
**Stefany Natacha Szynwelski** — Análise e Desenvolvimento de Sistemas (Unisinos).