# Ryft E-commerce

A modern e-commerce website built with HTML, CSS, JavaScript, and Supabase.

## Features

- Product catalog with detailed views
- Shopping cart functionality
- User authentication
- Checkout process with UPI payment
- Responsive design
- Database integration with Supabase

## Setup

1. Clone the repository:
```bash
git clone https://github.com/goryft/experience.git
cd experience
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

### Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

### Supabase Setup

1. Create a new project in Supabase
2. Run the SQL schema from `supabase/schema.sql`
3. Get your project URL and anon key
4. Add them to your environment variables

## Project Structure

```
├── index.html              # Homepage
├── product-detail.html     # Product detail page
├── cart.html              # Shopping cart
├── checkout.html          # Checkout process
├── js/                    # JavaScript files
│   ├── supabase.js        # Supabase client
│   └── main.js            # Main application logic
├── css/                   # Stylesheets
│   └── style.css          # Main styles
├── images/                # Image assets
└── supabase/             # Database schema
    └── schema.sql        # SQL schema
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 