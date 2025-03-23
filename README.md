# 🚚 Planejador de Rotas - Next.js 14 + TypeScript + Leaflet + OSRM

Este é um projeto de **planejador de rotas** para entregas, utilizando as melhores tecnologias modernas:

- ✅ Next.js 14 (App Router)
- ✅ TypeScript
- ✅ Leaflet e Leaflet Routing Machine
- ✅ Shadcn (UI Components)
- ✅ Tailwind CSS
- ✅ API pública do OSRM para cálculo de rotas
- ✅ Recharts para gráficos de estatísticas (opcional)

---

## 📸 Funcionalidades

- Inserir CEP de origem
- Adicionar múltiplos endereços de entrega via CEP
- Ordenar endereços com drag & drop (usando @hello-pangea/dnd)
- Otimizar a sequência das entregas
- Traçar a rota diretamente no mapa (Leaflet)
- Exibir estatísticas de distância e tempo total estimado
- Design responsivo e moderno

---

## 📁 Estrutura principal de pastas

```
src/
│
├─ components/
│   ├─ leaflet/
│   ├─ route-planner/
│   └─ ui/  (shadcn)
│
├─ lib/
│   ├─ route-manager.ts
│   └─ geocode-service.ts
│
├─ types/
│   ├─ import.ts
│   ├─ leaflet-routing-machine.d.ts
│   └─ window.d.ts
│
└─ app/
    └─ route-planner-client.tsx
```

---

## 🚀 Como rodar o projeto

1. Clone o repositório:
```bash
git clone <seu-repo>
cd <seu-repo>
```

2. Instale as dependências usando `pnpm`:
```bash
pnpm install
```

3. Rode o projeto:
```bash
pnpm dev
```

4. Abra no navegador:
```
http://localhost:3000
```

---

## ⚠ Aviso importante

> Este projeto utiliza o servidor público de demonstração do OSRM:  
> `https://router.project-osrm.org`  
> Ele não é adequado para produção, podendo apresentar instabilidades.  
> Para produção, utilize seu próprio servidor OSRM ou algum serviço pago.

---

## ✅ Requisitos

- Node.js 18+
- pnpm 8+
- Navegador moderno
- Chave válida de API do Google (se usar autocomplete do geocode)

---

## 🌟 Contribuição

Pull Requests são muito bem-vindos!  
Sinta-se à vontade para contribuir com melhorias, ajustes de tipagens e sugestões.

---

## 📜 Licença

MIT License.

---

# 🇺🇸 Route Planner - Next.js 14 + TypeScript + Leaflet + OSRM

This is a **delivery route planner** project built with modern technologies:

- ✅ Next.js 14 (App Router)
- ✅ TypeScript
- ✅ Leaflet and Leaflet Routing Machine
- ✅ Shadcn (UI Components)
- ✅ Tailwind CSS
- ✅ Public OSRM API for route calculation
- ✅ Recharts for statistics (optional)

---

## 📸 Features

- Add origin by postal code (CEP)
- Add multiple delivery addresses by postal code
- Drag & drop to reorder addresses
- Optimize delivery route order
- Draw the route directly on the map
- Show estimated total distance and time
- Fully responsive and modern UI

---

## 📁 Folder structure

```
src/
│
├─ components/
│   ├─ leaflet/
│   ├─ route-planner/
│   └─ ui/ (shadcn)
│
├─ lib/
│   ├─ route-manager.ts
│   └─ geocode-service.ts
│
├─ types/
│   ├─ import.ts
│   ├─ leaflet-routing-machine.d.ts
│   └─ window.d.ts
│
└─ app/
    └─ route-planner-client.tsx
```

---

## 🚀 How to run

1. Clone the repository:
```bash
git clone <your-repo>
cd <your-repo>
```

2. Install dependencies with `pnpm`:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open the app:
```
http://localhost:3000
```

---

## ⚠ Important notice

> This project uses OSRM's public demo server:  
> `https://router.project-osrm.org`  
> It is not suitable for production and can be unstable.  
> For production, host your own OSRM server or use a paid provider.

---

## ✅ Requirements

- Node.js 18+
- pnpm 8+
- Modern browser
- Valid Google API key (if using geocode autocomplete)

---

## 🌟 Contributing

Pull Requests are welcome!  
Feel free to help with improvements, better typings, and suggestions.

---

## 📜 License

MIT License.

