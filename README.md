# Marcador de Bozo

Este é um projeto simples de marcador de pontos para o jogo de Bozo.

## Recursos

- Adicionar jogadores dinamicamente
- Preencher pontuação por categoria
- Cálculo automático do total por jogador
- Interface leve em HTML, CSS e JavaScript

## Regras do jogo Bozo

| Nome | Descrição | Pontuação |
| --- | --- | --- |
| Ás | Soma dos dados com lado do dado com 1 ponto | 1 a 5 |
| Duque | Soma dos dados com lado do dado com 2 pontos | 2 a 10 |
| Terno | Soma dos dados com lado do dado com 3 pontos | 3 a 15 |
| Quadra | Soma dos dados com lado do dado com 4 pontos | 4 a 20 |
| Quina | Soma dos dados com lado do dado com 5 pontos | 5 a 25 |
| Sena | Soma dos dados com lado do dado com 6 pontos | 6 a 30 |
| Fu | Dois dados de um mesmo tipo + 3 dados de um mesmo tipo | 20 |
| Seguida | Cada dado com um lado diferente - sequencial (de 1 a 5 ou de 2 a 6) | 30 |
| Quadrada | Quatro dados com o mesmo lado + um dado com lado diferente | 40 |
| General | Todos os dados com o mesmo lado | 50 |

> Cada jogador tem até três jogadas por turno. Após a primeira rolagem, ele pode escolher quais dados manter e quais relançar. Ao final, deve preencher uma categoria disponível no placar.

## Como usar

1. Abra `index.html` em um navegador.
2. Digite o nome do jogador e clique em **Adicionar jogador**.
3. Preencha a pontuação nas categorias.
4. O total é atualizado automaticamente.

## Estrutura do projeto

- `index.html` — interface principal
- `styles.css` — estilos visuais
- `script.js` — lógica do marcador
- `README.md` — documentação
