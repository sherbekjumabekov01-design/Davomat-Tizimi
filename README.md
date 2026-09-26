# Davomat Tizimi (CRM Attendance System)

O'quv markazlari va ta'lim muassasalari uchun mo'ljallangan zamonaviy, tezkor va qulay CRM uslubidagi davomatni boshqarish tizimi (Modme matrix UI asosida).

---

## 🚀 Imkoniyatlari (Features)

- **Davomat Matrix Jadvali (Attendance Board):**
  - Modme uslubidagi interaktiv oylik davomat matritsasi.
  - Bir marta bosish orqali holatni o'zgartirish (*Bor edi*, *Yo'q*, *Tozalash*).
  - Hover popover yordamida tezkor tanlash imkoniyati.
  - Sahifani qayta yuklamasdan (in-place) real vaqt rejimida saqlash.

- **Tanga (Coins) Rag'batlantirish Tizimi:**
  - Talabalarga faolligi va darsdagi ishtiroki uchun tanga (coin) berish.
  - "Show coins" tugmasi orqali tangalar ustunini ko'rsatish yoki yashirish.

- **Moslashuvchan Dizayn (Responsive UI):**
  - Noutbuk (1366x768), planshet va mobil qurilmalarga to'liq moslashgan layout.
  - Guruh ma'lumotlari panelini bitta tugma orqali ochish / yopish.
  - Talabalarni A-Z va Z-A bo'yicha tezkor saralash.

- **Eksport va Hisobotlar:**
  - Oylik davomat natijalarini Excel (.csv) formatida yuklab olish.

- **Backend API (.NET 10):**
  - ASP.NET Core Web API, Entity Framework Core, SQLite bazasi.
  - Swagger UI orqali API testlash (`/swagger`).
  - Dastlabki namunaviy ma'lumotlarni avtomat to'ldirish (DbInitializer).

---

## 🛠 Texnologiyalar (Tech Stack)

- **Backend:** C# / .NET 10, ASP.NET Core Web API, EF Core SQLite
- **Frontend:** HTML5, Modern Vanilla CSS (Dark glassmorphic aesthetic), JavaScript (Fetch API)
- **Ma'lumotlar bazasi:** SQLite (`davomat.db`)

---

## 📦 O'rnatish va Ishga Tushirish (Quick Start)

### 1. Talablar
- [.NET 10 SDK](https://dotnet.microsoft.com/download)

### 2. Loyihani yuklab olish
```bash
git clone <repository-url>
cd "Davomat Tizimi"
```

### 3. Backend va Frontendni ishga tushirish
```bash
cd Backend
dotnet run
```

Brauzerda quyidagi manzillarni oching:
- **Tizim:** `http://localhost:5041`
- **Swagger API:** `http://localhost:5041/swagger`
