Problem statement:-
Building a platform for households, industries and various infrastructures to address the opacity of energy transition costs and long-term savings. 

India's commercial and industrial sector accounts for ~45% of total electricity consumption, yet fewer than 8% of enterprises have adopted on-site renewable energy. The barrier, in most cases, isn't technology — it's financial uncertainty.

Today, a facility manager who wants to pitch solar panels or wind turbines to their CFO faces:

No clear ROI visibility — "How much will this actually save us?"
No break-even clarity — "When do we start making money?"
No comparison framework — "New build vs retrofit? Solar vs wind vs hybrid?"
No carbon quantification — "How do we report this for ESG compliance?"

Urban households and complexes would benefit too, but face the same questions. 

They're left with vendor quotes (biased), Excel sheets (error-prone), and guesswork (risky). The result? Billions in potential green savings go unrealized because decision-makers can't see the numbers.

What Urja Solves?
An instant, interactive ROI simulator that turns green energy from a "maybe" into a boardroom-ready business case — in under 60 seconds, turning climate action into a confident financial decision.

Slide a few inputs (roof space, facility type, energy mix) → get CapEx, payback period, annual savings, and CO2 offset instantly
Visualize the 10-year break-even trajectory so CFOs see exactly when investment turns profitable
Compare new build vs retrofit scenarios side-by-side
Generate financial reports ready for ESG disclosures and investor decks
Backed by a real database (PostgreSQL + pgvector) ready to scale with AI-driven recommendations



The Tech Stack (Built for Speed)
Frontend: React.js (Vite) or plain HTML/Vanilla JS if your team is faster with it.

Styling: Tailwind CSS. Do not write custom CSS; you don't have time. Tailwind’s utility classes will let you build an enterprise-looking dashboard in hours.

Charting: Recharts (for React) or Chart.js (for Vanilla JS). These are plug-and-play libraries that animate beautifully.

Icons: Lucide-React or FontAwesome for slick, corporate iconography.

Step-by-Step Execution Plan
Phase 1: The UI Skeleton 
Divide your screen real estate into a classic B2B SaaS layout.

Header (Top 10%): Project logo, title, and an "Export Report" button (this can just trigger the browser's print dialog to save as PDF—a great hackathon trick).

Control Panel (Left 30%): The "Control Room" where the user inputs their building parameters.

Dashboard View (Right 70%): Where the math comes to life. Split this into a top row of 4 "KPI Cards" and a large central chart area below it.

Phase 2: Building the Control Panel 
This is where the user interacts. Build these specific input fields:

Facility Type: A dropdown (Corporate IT Park, Government Complex, Manufacturing Hub, Heritage Building).

Infrastructure Status: A toggle or two buttons: "New Construction" vs. "Retrofit (Existing)".

Usable Roof Space: A slider ranging from 5,000 to 100,000+ square feet (or square meters).

Energy Mix Allocator:

Solar Allocation: A slider (0% to 100% of the roof space).

Micro-Wind Turbines: A number input or slider (0 to 50 units) for parking lots or roof edges.

Phase 3: The Calculation Engine 
This is the "brain" of your app. Write a single JavaScript function that takes the inputs from Phase 2 and calculates the outputs for Phase 4.

The Retrofit Penalty: If the user selects "Retrofit," multiply the total installation cost (CapEx) by 1.20 (representing structural reinforcement and rewiring).

Solar Math: Calculate cost based on the area allocated. Calculate energy generation based on standard commercial panel efficiency.

Wind Math: Multiply the number of turbines by a fixed cost and a fixed annual energy output.

Pro-Tip for Local Impact: To really impress the judges, configure your base metrics using local commercial electricity tariffs for West Bengal and display the financials in INR. It makes the project feel immediately applicable to your local ecosystem.

Phase 4: Data Visualization & KPI Cards 
Wire your calculation engine to the UI.

The 4 KPI Cards:

Total CapEx: The upfront cost to install.

Annual Savings: Money saved on the grid electricity bill.

Payback Period: CapEx divided by Annual Savings (e.g., "4.2 Years").

CO2 Offset: Annual savings translated into Metric Tons of Carbon.

The Main Chart (The Break-Even Graph): A 10-year line or bar chart. The Y-axis is money, the X-axis is years. Year 0 starts deep in the red (the installation cost). Each year, the line climbs up by the "Annual Savings" amount until it crosses the $0 line. The point where it turns green is the Payback Period.

Phase 5: Polish and Pitch Prep (Sunday Morning)
The Theme: Go with a "Dark Mode" theme. Dark slate gray backgrounds with neon green and electric blue accents for the charts. It looks incredibly premium and futuristic on a projector.

Bug Squashing: Hardcode maximums on your sliders so the math doesn't break or produce NaN (Not a Number) errors during the demo.

