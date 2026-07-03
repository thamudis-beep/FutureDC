---
title: "The Great GPU Shortage – Rental Capacity – Launching our H100 1 Year Rental Price Index"
authors: [Daniel Nishball, Jordan Nanos, Cheang Kang Wen, Nigel Chiang (guest), "+2 others"]
publication: SemiAnalysis
date: 2026-04-02
type: research-newsletter
url: https://semianalysis.com/ (exact permalink not recorded)
retrieved: 2026-04-05
---

# The Great GPU Shortage – Rental Capacity – Launching our H100 1 Year Rental Price Index

**H100 Rental Prices up 40%, GPU Rental Pricing Dashboard Launch, Compute Rental Market Structure, Will Rental Prices keep going up?**

Anthropic's Claude 4.6 Opus and Claude Code have soared in demand. Anthropic's ARR has nearly tripled in just a single quarter from $9B at the end of last year to over $25B today. Open models such as GLM and Kimi K2.5 caused open model use cases to soar. Capital raises by firms like Anthropic, OpenAI, and various Neolabs also demand GPUs.

This inflection point means that demand has spiked and there's been a run on GPUs at the hyperscalers and Neoclouds.

This new source of demand has spiked pricing for products and services across the supply chain, from DRAM and NAND memory to fiber optic cables, datacenter colocation and gas turbines.

GPU Rental Pricing is the latest of many compute related products and services to see a dramatic tightness in supply and resulting jump in pricing. H100 1-year GPU rental contract pricing has shot up almost 40% from a low of $1.70/hr/GPU in October 2025 to $2.35/hr/GPU by March 2026.

On-Demand GPU rental capacity is sold out across all GPU types – those that have locked up on-demand instances are not willing to relinquish this capacity back into the pool despite recent price hikes. Trying to find GPU compute in early 2026 has been like trying to book airplane tickets on the last flight out, high prices, and almost no availability. That's the PC analogy, but the more accurate analogy is that trying to rent a cluster is actually like trying to buy drugs.

## Surge Pricing Comes to the GPU Rental Market

The chart illustrating the 1y H100 rental price hardly does the trend justice – anecdotes from our first-hand experience in trying to procure compute and feedback from others in the market paints an even starker picture.

Demand is strong across many very heterogeneous use cases and there is no one-size fits all approach. There are plenty of inference workloads like large mixture of experts (MoE) inference that run best on the latest large world-size systems like the GB300 NVL72, while training workloads can have the best price performance on H100s, keeping demand high even for older cards.

Customers are fighting to pay $14/hr/GPU for p6-b200 spot instances in AWS, some Neocloud Giants no longer sell single nodes, H100s are getting renewed at the exact same rate they were signed at 2-3 years ago and some H100 contracts are being renewed for 4 years though 2028. Hunting for even 8 nodes (64 GPUs) of H100s or H200s is not easy – half the providers we asked were completely sold out, and most providers will simply respond they have no capacity of Hopper GPUs coming off contract at all.

We have even heard of renters of compute subdividing their clusters and subletting the compute just like an apartment during the Monaco Grand Prix. Coming soon – the rise of Neocloud slumlords?

Blackwell availability is very tight too. We are hearing lead times for new Blackwell deployments now extending into June-July thanks to strong demand for open-weight models as well as the ongoing surge in inference demand, and most of these clusters are now getting taken up. Indeed, market-wide, all capacity coming online until August to September 2026 has already been booked!

## GPU Rental Prices – The Comeback Kid

Only six months ago, most market observers were skeptical on GPU terminal value and assumed an inexorably steep fall in GPU rental rates over time. Financial analysts chastised any Neocloud or Hyperscaler that used a 6-year depreciation period for its GPU compute assets.

Before late 2025, the prevailing expectation across the ecosystem was that Hopper (i.e. H100 and H200) rental prices would drop considerably as Blackwell deployments ramped given the latter's much lower cost of compute. Instead, the opposite happened in late 2025: demand for H100s was holding firm, and in many cases, strengthening. The rapid adoption of open-weight models and accelerating inference demand at that time was the first sign of the insatiable wave of compute demand coming to market.

January was the next inflection point for compute when memory pricing, across both DRAM and NAND pricing, went from rising aggressively for several quarters, to going completely parabolic, with LPDDR5 and DDR5 contract prices tracking toward ~4x and ~5x year-on-year increases respectively in 1Q26.

To manage margin risk stemming from this rapid hike in component costs, OEMs began repricing AI servers at levels that significantly exceeded the underlying increase in component costs. This complicated the cluster capital investment processes as higher server acquisition costs compressed prospective project returns, forcing some operators to slow-roll or abandon deployments. In effect, supply that would have otherwise come online was being withheld, tightening the rental market further.

Amid the server procurement disarray caused by this AI Server Pricing Apocalypse, GPU rental demand was clearly accelerating, with most remaining spare capacity taken up completely during January and February. By March – it became increasingly impossible to find any H100s, H200s or B200 rental capacity for any term. Rental pricing broke above $2/hr/GPU for a 1y contract by late January, and then shot up 15-20% by mid-to-late February vs end January and is set to rise another 15-20% month-on-month by the end of March.

A major driver of demand early this year arose from native media generation - Seedance and Nano Banana are driving massive increases in token throughput as users generate and refine images and video at scale. But the most visible driver of demand is the emergence of multi-agent workloads executing multi-step workflows, operating at high concurrency and iterating continuously, leading to parabolic growth in token and compute consumption.

SemiAnalysis as a company has, over the past 7 days, consumed billions of tokens costing around ~$5/M tok on average, but the return on time saved and expansion of workflows and capabilities far exceeds that cost. SemiAnalysis now deploys a suite of AI tools across workflows beyond simple search and summarization – notably dashboarding, automated scraping, large-scale data wrangling and agentic financial modelling.

At the current trajectory, we believe that Claude Code will be 20%+ of all daily commits by the end of 2026.

The debate on the true return of using AI is now a settled question – the use of AI tools can deliver value an order of magnitude greater than the cost of using the tools. The shift up and to the right in the demand curve for tokens is providing a powerful and relatively inelastic (for now) force driving up GPU rental pricing.

Put simply – if the return on investment from using AI tools is 5-10x, then there is clearly a long way to go in GPU rental pricing before prices rise enough to curtail demand.

## Introducing the SemiAnalysis 1Y H100 contract price index

Our index is constructed from direct survey data across a pool of 100+ market participants including Neocloud providers, buyers and sellers of compute that is captured every month to determine a representative range (25th to 75th percentile) for GPU rental contracts. We validate these pricing levels with transaction data as well as by arranging a few transactions ourselves, connecting buyers and sellers of compute within our network.

Since 2023, we have tracked the contract market price across 3m to 5y tenors for the H100, H200, B200, B300, GB200, GB300, and we have selected data available for the AMD complex as well (MI300, MI325, MI355).

The SemiAnalysis H100 1-year contract price index is additive to currently available GPU indices for a few different reasons:

- Many GPU rental indices are derived from spot/on-demand listings or posted pricing, but most of the GPU rental market is transacted on a long-term basis with contracts of at least 6mths and longer. Most large Neoclouds have a preference to rent out capacity on at least a 1-year term with 2 or 3 year terms preferred – even better if they can land 5y large offtake agreements.
- There is no guarantee that buyers of compute are actually transacting at prices publicly posted by Hyperscalers and Neoclouds. These posted prices may shift around, giving a helpful directional signal but cannot provide an accurate estimate for actual transaction prices. The on-demand market operates by fixing price at a constant level with take-up rates or utilization rates the variable.

## GPU Rental Market Structure Today

Before late 2025, GPU rental pricing was more competitive as operators had much greater GPU inventory while end demand was only starting to accelerate meaningfully.

GPU rental providers' strategy has pivoted 180 degrees since then. Neoclouds and Hyperscalers are now in the driver's seat – they can now negotiate for more favorable terms such as higher prepay, better pricing, longer contract lengths and can even pick and choose the contract start and end dates to match their inventory availability.

The GPU rental market structure is best understood by dividing it into three primary market segments:

### Short-term Rental: On-Demand, Spot, Less than 3-Month Contracts

Short-term rentals represent the very front end of the rental term structure and in many cases represents residual capacity, though many such as Runpod and Lambda very successfully focus on providing considerable capacity of flexible on-demand or spot capacity. On-demand pricing tends to function very differently than the rest of the contract GPU rental market. Providers usually set a fixed price for on-demand capacity and will only very infrequently adjust prices.

Providers will adjust pricing on a one-off basis in response to utilization levels – if utilization is too low, they will drop pricing to attract demand. If utilization is maxed out – then prices will be hiked. With the on-demand market, utilization is the best high frequency indicator of demand, and not price.

### Mid-Term Contracts

The more economically relevant segments are the contract markets where most GPU rentals by value are transacted. The 1-year segment captures the marginal demand from non-AI lab customers and spillovers from large buyers, making it the most sensitive indicator of tightening conditions. AI Natives and smaller AI Labs can be seen mostly in the 1-3y tenors, though increasingly these labs and AI Natives are looking to lock up compute by contracting for longer terms of more than 4 years and even agreeing to high prepays of above 20% which were previously atypical for 4y+ deals.

### Long-Term Offtakes

The 4–5 year segment is dominated by AI labs locking in huge quantities of capacity early. These deals involve large clusters of 50MW or 100MW or even larger – equivalent to about ~24,000 to 48,000 GB300 NVL72 GPUs. In aggregate – these deals represent a very large proportion of the overall Neocloud GPU rental market.

AI Labs like these contracts as they can lock in a huge amounts of compute in one go. The AI Labs also have considerable influence on the cluster design. These are very often bare metal deals as AI Labs have the engineering expertise to customize more layers of the tech stack.

Neoclouds like these deals as they can focus their sales resources on just a few large offtake deals rather than dozens of smaller deals. Longer-term contracts are also great for Neoclouds as they can then use these contracts to arrange debt financing on favorable terms that will match the tenor of the contract, removing most duration and GPU rental price risk and locking in a teens project IRR in most cases. It is also common to see Hyperscalers backstop these deals – serving as the direct offtaker from these Neoclouds but then on-selling the compute to an AI Lab.

## Where The Puck is Going

What is most striking is the disconnect between these underlying dynamics and broader market sentiment. Despite clear evidence of tightening supply and rising prices - conditions that should directly benefit Neocloud providers through margin expansion and stronger arguments for higher useful lives - public market sentiment has turned increasingly negative on names like CoreWeave, Nebius, IREN, and these companies' share prices are currently at the low end of the 6-12mth trading range.

The market is still anchored to a narrative of eventual oversupply and commoditization, and the developments described above have done little to assuage concerns on GPU terminal value.

Three check points to monitor:

1. GB300 clusters will ramp throughout 2026. We will monitor the extent to which additional compute capacity coming to market ameliorates the ongoing compute crunch or whether token demand will outpace these additions.
2. The extent to which the ongoing silicon shortage worsens. Tightness in TSMC's N3 logic wafer capacity and HBM, DRAM and NAND memory.
3. How ARR for AI labs continues to scale – and the rate at which adoption spreads and token consumption continues to grow.

## Pricing is Only Going One Way For Now, and ROIC Follows

GPU rental pricing is more likely to continue rising than falling.

The dynamic is self-reinforcing. As Neoclouds see supply tighten and prices rise, they move to secure more hardware ahead of further price increases, which only tightens supply and pushes pricing higher still.

The re-acceleration in GPU rental pricing improves Neocloud ROIC by expanding margins on already-deployed capital. At the same time, higher rental rates extend the economic useful life of existing GPUs, meaning invested capital generates cash flows for longer before requiring reinvestment.

For now, the clearest beneficiaries are providers with:

- Shorter-duration contracts (repricing faster)
- Large H100 install bases
- Near-term capacity additions

---

*Guest post by Nigel Chiang. SemiAnalysis, April 2, 2026.*
