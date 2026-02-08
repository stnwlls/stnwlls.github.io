// Credit score to interest rate adjustment mapping
const CREDIT_SCORE_ADJUSTMENTS = {
    '760': { rateAdjustment: -0.50, pmiRate: 0.35, label: 'Excellent', color: '#28a745', minConventional: true },
    '740': { rateAdjustment: -0.25, pmiRate: 0.45, label: 'Very Good', color: '#28a745', minConventional: true },
    '720': { rateAdjustment: -0.125, pmiRate: 0.50, label: 'Good', color: '#28a745', minConventional: true },
    '700': { rateAdjustment: 0, pmiRate: 0.55, label: 'Good', color: '#28a745', minConventional: true },
    '680': { rateAdjustment: 0.125, pmiRate: 0.65, label: 'Average', color: '#ffc107', minConventional: true },
    '660': { rateAdjustment: 0.25, pmiRate: 0.75, label: 'Fair', color: '#ffc107', minConventional: true },
    '640': { rateAdjustment: 0.50, pmiRate: 0.90, label: 'Fair', color: '#ff9800', minConventional: true },
    '620': { rateAdjustment: 0.75, pmiRate: 1.10, label: 'Poor', color: '#ff5722', minConventional: true },
    '600': { rateAdjustment: 1.25, pmiRate: 1.30, label: 'Poor', color: '#ff5722', minConventional: false },
    '580': { rateAdjustment: 1.75, pmiRate: 1.40, label: 'Very Poor - FHA Only', color: '#dc3545', minConventional: false },
    '560': { rateAdjustment: 2.00, pmiRate: 1.50, label: 'FHA Only - 10% Down Required', color: '#dc3545', minConventional: false },
    '540': { rateAdjustment: 2.25, pmiRate: 1.50, label: 'FHA Only - 10% Down Required', color: '#dc3545', minConventional: false }
};

// FHA MIP Rate Calculator
function calculateFHAMIP(loanAmount, downPaymentPercent, loanTerm) {
    const FHA_LIMIT = 726200;
    let annualMIPRate = 0.55; // Default
    
    if (loanTerm > 15) {
        // 30-year loan
        if (loanAmount > FHA_LIMIT) {
            // High-balance loan
            annualMIPRate = downPaymentPercent < 5 ? 0.75 : 0.70;
        } else {
            // Standard loan
            annualMIPRate = downPaymentPercent < 5 ? 0.55 : 0.50;
        }
    } else {
        // 15-year or less
        if (loanAmount > FHA_LIMIT) {
            annualMIPRate = downPaymentPercent < 10 ? 0.45 : 0.40;
        } else {
            annualMIPRate = downPaymentPercent < 10 ? 0.25 : 0.15;
        }
    }
    
    return annualMIPRate;
}

// State-specific program data
const STATE_PROGRAMS = {
    MA: {
        name: 'Massachusetts',
        defaultTaxRate: 1.17,
        defaultInsurance: 1500,
        programs: [
            {
                id: 'ma_masshousing',
                name: 'MassHousing First-Time Homebuyer',
                dpaMax: 25000,
                dpaType: 'secondLoan',
                dpaInterestRate: 0,
                monthlyCost: 160, // Real cost from broker
                rateAdjustment: 0.375,
                incomeLimit: '156,400-191,100',
                requirements: 'First-time buyer or no ownership in 3 years, 5% down payment',
                description: '⚠️ Costs $160/month - Use with 5% down, remaining for closing costs',
                minCreditScore: 660,
                brokerNote: 'Per broker: $160/mo cost, recommend 5% down + use rest for closing'
            },
            {
                id: 'ma_one',
                name: 'ONE Mortgage Program',
                dpaMax: 0,
                dpaType: 'grant',
                dpaInterestRate: 0,
                rateAdjustment: 0,
                incomeLimit: 'Varies by area',
                requirements: '3% down minimum, no PMI required, first-time buyers',
                description: 'Unique program that eliminates PMI requirement',
                minCreditScore: 660
            },
            {
                id: 'ma_soft_second',
                name: 'MA Housing Partnership Soft Second',
                dpaMax: 50000,
                dpaType: 'deferredLoan',
                dpaInterestRate: 0,
                rateAdjustment: 0,
                incomeLimit: 'Varies by area',
                requirements: 'Repay upon sale, refinance, or payoff',
                description: '0% interest deferred loan, highest DPA amount available',
                minCreditScore: 640
            },
            {
                id: 'ma_city',
                name: 'City-Specific Programs (Boston/Worcester/Springfield)',
                dpaMax: 15000,
                dpaType: 'grant',
                dpaInterestRate: 0,
                rateAdjustment: 0,
                incomeLimit: 'Varies by city',
                requirements: 'First-time buyer, property must be in participating city',
                description: 'Additional assistance for specific municipalities',
                minCreditScore: 640
            }
        ]
    },
    NH: {
        name: 'New Hampshire',
        defaultTaxRate: 1.86,
        defaultInsurance: 1150,
        programs: [
            {
                id: 'nh_first_home',
                name: 'NH Housing First Home Loan',
                dpaMax: 15000,
                dpaType: 'secondLoan',
                dpaInterestRate: 0.5,
                monthlyCost: 0, // Calculate from interest
                rateAdjustment: 0.75, // Broker says rates much higher
                incomeLimit: '126,000-157,500',
                requirements: 'First-time buyer or no ownership in 3 years',
                description: '⚠️ Higher rates - Broker recommends using your own down payment instead',
                minCreditScore: 620,
                brokerNote: 'Per broker: Rates are much higher, better to use own $ for down payment'
            },
            {
                id: 'nh_workforce',
                name: 'Workforce Housing Program',
                dpaMax: 10000,
                dpaType: 'secondLoan',
                dpaInterestRate: 1.0,
                monthlyCost: 0,
                rateAdjustment: 0.5, // Higher rates for NH programs
                incomeLimit: 'Moderate-income families',
                requirements: 'Purchase price limits vary by county',
                description: '⚠️ Higher rates - Consider saving for down payment instead',
                minCreditScore: 620,
                brokerNote: 'NH programs have higher rates per broker'
            },
            {
                id: 'nh_military',
                name: 'Military Service Member Home Loan',
                dpaMax: 5000,
                dpaType: 'grant',
                dpaInterestRate: 0,
                rateAdjustment: -0.5,
                incomeLimit: 'No limit',
                requirements: 'Active duty military or veteran status',
                description: 'Rate reduction benefit plus assistance for those who served',
                minCreditScore: 580
            },
            {
                id: 'nh_energy',
                name: 'Energy-Efficient Mortgage',
                dpaMax: 5000,
                dpaType: 'grant',
                dpaInterestRate: 0,
                rateAdjustment: 0,
                incomeLimit: 'Standard limits',
                requirements: 'Funds must be used for energy improvements',
                description: '✨ Can be combined with other programs - Extra $5,000 for energy improvements',
                minCreditScore: 620
            }
        ]
    }
};

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Utility function to format currency with decimals
function formatCurrencyDetailed(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Calculate monthly mortgage payment (P&I)
function calculateMortgagePayment(principal, annualRate, years) {
    if (principal <= 0 || annualRate === 0) {
        return principal / (years * 12);
    }
    
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return payment;
}

// Calculate homeowners insurance based on home value
function calculateHomeInsurance(homePrice, propertyType, state) {
    // Base rate per $100k of home value
    let baseRate = 40; // National average
    
    // Adjust by property type
    switch(propertyType) {
        case 'condo':
        case 'townhouse':
            baseRate = 30; // Lower for shared structures
            break;
        case 'multi':
            baseRate = 50; // Higher for multi-family
            break;
        case 'single':
        default:
            baseRate = 40;
    }
    
    // Adjust by state
    if (state === 'MA') {
        baseRate *= 1.05; // Slightly higher in MA
    } else if (state === 'NH') {
        baseRate *= 0.95; // Slightly lower in NH
    }
    
    // Calculate annual insurance
    const annualInsurance = (homePrice / 100000) * baseRate;
    
    return Math.round(annualInsurance / 100) * 100; // Round to nearest $100
}

// Update homeowners insurance automatically
function updateHomeInsurance() {
    const autoCalc = document.getElementById('autoCalculateInsurance').checked;
    const insuranceInput = document.getElementById('homeInsurance');
    const helpText = document.getElementById('insuranceHelp');
    
    if (!autoCalc) {
        insuranceInput.disabled = false;
        helpText.textContent = 'Enter your actual insurance quote';
        return;
    }
    
    const homePrice = parseFloat(document.getElementById('homePrice').value.replace(/,/g, '')) || 0;
    const propertyType = document.getElementById('propertyType').value;
    const state = document.getElementById('state').value;
    
    if (homePrice > 0) {
        const estimated = calculateHomeInsurance(homePrice, propertyType, state);
        insuranceInput.value = estimated.toLocaleString('en-US');
        insuranceInput.disabled = true;
        helpText.textContent = `Auto-calculated: ~$${(estimated/homePrice*100000).toFixed(0)} per $100k of home value`;
    }
}

// Update down payment percentage display
function updateDownPaymentSummary() {
    const homePrice = parseFloat(document.getElementById('homePrice').value.replace(/,/g, '')) || 0;
    const cashDown = parseFloat(document.getElementById('cashDownPayment').value.replace(/,/g, '')) || 0;
    const dpaAmount = parseFloat(document.getElementById('dpaAmount').value.replace(/,/g, '')) || 0;
    const summaryDiv = document.getElementById('downPaymentSummary');
    const pmiStatusDiv = document.getElementById('pmiStatus');
    const pmiCheckbox = document.getElementById('requiresPMI');
    const pmiDetails = document.getElementById('pmiDetails');
    const pmiOverride = document.getElementById('pmiOverride');
    const creditScore = document.getElementById('creditScore').value;
    const loanType = document.getElementById('loanType').value;
    const loanTerm = parseInt(document.getElementById('loanTerm').value) || 30;
    
    if (homePrice > 0) {
        summaryDiv.style.display = 'block';
        
        const totalDown = cashDown + dpaAmount;
        const loanAmount = homePrice - totalDown;
        const percent = (totalDown / homePrice * 100).toFixed(2);
        
        document.getElementById('displayCash').textContent = formatCurrency(cashDown);
        document.getElementById('displayDPA').textContent = formatCurrency(dpaAmount);
        document.getElementById('displayTotal').textContent = formatCurrency(totalDown);
        document.getElementById('displayPercent').textContent = `${percent}%`;
        document.getElementById('displayLoan').textContent = formatCurrency(loanAmount);
        
        // Auto-determine PMI requirement
        if (percent < 20) {
            // PMI/MIP is required
            pmiCheckbox.checked = true;
            pmiDetails.style.display = 'block';
            pmiOverride.style.display = 'none';
            
            // Calculate PMI/MIP rate
            let insuranceRate = 0.5; // Default
            let insuranceLabel = 'PMI';
            let insuranceType = 'Conventional PMI';
            
            if (loanType === 'fha') {
                // FHA MIP calculation
                insuranceLabel = 'Annual MIP';
                insuranceType = 'FHA MIP';
                insuranceRate = calculateFHAMIP(loanAmount, parseFloat(percent), loanTerm);
                
                // Show upfront MIP info
                const upfrontMIP = loanAmount * 0.0175;
                const newLoanAmount = loanAmount + upfrontMIP;
                document.getElementById('fhaUpfrontMIPInfo').innerHTML = `
                    1.75% of base loan amount = ${formatCurrency(upfrontMIP)}<br>
                    This will be added to your loan, making total loan ${formatCurrency(newLoanAmount)}
                `;
            } else {
                // Conventional PMI - adjust based on credit score and down payment
                if (creditScore && CREDIT_SCORE_ADJUSTMENTS[creditScore]) {
                    insuranceRate = CREDIT_SCORE_ADJUSTMENTS[creditScore].pmiRate;
                    
                    // Adjust PMI based on down payment percentage
                    if (percent < 5) {
                        insuranceRate += 0.2;
                    } else if (percent < 10) {
                        insuranceRate += 0.1;
                    } else if (percent >= 15) {
                        insuranceRate -= 0.1;
                    }
                }
            }
            
            document.getElementById('pmiRate').value = insuranceRate.toFixed(2);
            document.getElementById('pmiLabel').textContent = insuranceLabel;
            document.getElementById('pmiRateHelp').textContent = `Based on ${loanType === 'fha' ? 'FHA rules' : 'credit score'}, ${percent}% down, and ${loanTerm}-year term`;
            
            const monthlyInsurance = Math.round(loanAmount * insuranceRate / 100 / 12);
            
            let durationText = '';
            if (loanType === 'fha') {
                if (percent >= 10) {
                    durationText = '<br><span style="color: #28a745;">MIP will drop off after 11 years</span>';
                } else {
                    durationText = '<br><span style="color: #dc3545;">MIP required for full loan term (30 years)</span>';
                }
            } else {
                durationText = '<br><span style="color: #28a745;">PMI drops at 20% equity (~$' + Math.round((20 - percent) * homePrice / 100) + ' more paid)</span>';
            }
            
            pmiStatusDiv.innerHTML = `
                <span style="color: #dc3545; font-weight: 600;">⚠ ${insuranceType} Required</span>
                <div style="margin-top: 5px; color: #666;">
                    Down payment is ${percent}% (need ${loanType === 'fha' && loanTerm <= 15 ? '22%' : '20%'} to avoid insurance)
                    <br>${insuranceLabel} Rate: ${insuranceRate.toFixed(2)}% annually (~$${monthlyInsurance}/month)
                    ${durationText}
                </div>
            `;
        } else {
            // PMI not required
            pmiCheckbox.checked = false;
            pmiDetails.style.display = 'none';
            pmiOverride.style.display = 'block';
            
            const savings = Math.round(loanAmount * 0.5 / 100 / 12);
            const insuranceLabel = loanType === 'fha' ? 'MIP' : 'PMI';
            pmiStatusDiv.innerHTML = `
                <span style="color: #28a745; font-weight: 600;">✓ No ${insuranceLabel} Required</span>
                <div style="margin-top: 5px; color: #666;">
                    Down payment is ${percent}% (20%+ required)
                    <br>Saving ~$${savings}/month by avoiding ${insuranceLabel}!
                </div>
            `;
        }
        
        // Update homeowners insurance if auto-calc is enabled
        updateHomeInsurance();
    } else {
        summaryDiv.style.display = 'none';
        pmiStatusDiv.textContent = 'Enter down payment information to determine if PMI/MIP is required';
    }
}

// Toggle conditional sections
function toggleSection(checkboxId, sectionId) {
    const checkbox = document.getElementById(checkboxId);
    const section = document.getElementById(sectionId);
    
    checkbox.addEventListener('change', function() {
        section.style.display = this.checked ? 'block' : 'none';
    });
}

// Update state-specific programs display
function updateStatePrograms() {
    const state = document.getElementById('state').value;
    const card = document.getElementById('stateProgramsCard');
    const content = document.getElementById('stateProgramsContent');
    
    if (!state) {
        card.style.display = 'none';
        clearDPASelection();
        return;
    }
    
    card.style.display = 'block';
    const stateData = STATE_PROGRAMS[state];
    
    // Update default values
    document.getElementById('propertyTaxRate').value = stateData.defaultTaxRate;
    document.getElementById('homeInsurance').value = stateData.defaultInsurance;
    
    // Build clickable programs HTML
    let html = '';
    
    stateData.programs.forEach(program => {
        const maxDPAText = program.dpaMax > 0 ? `<strong style="color: #667eea;">Max DPA: ${formatCurrency(program.dpaMax)}</strong>` : '<strong style="color: #888;">No Direct DPA</strong>';
        
        html += `
            <div class="state-program-item" data-program-id="${program.id}" onclick="selectDPAProgram('${program.id}')">
                <h5 style="color: #667eea; margin-bottom: 8px; font-size: 1.1rem;">${program.name}</h5>
                <p style="color: #666; font-size: 0.9rem; margin: 8px 0; line-height: 1.5;">${program.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; flex-wrap: wrap; gap: 10px;">
                    <div>${maxDPAText}</div>
                    ${program.rateAdjustment !== 0 ? `<div style="color: ${program.rateAdjustment > 0 ? '#dc3545' : '#28a745'}; font-weight: 600;">Rate: ${program.rateAdjustment > 0 ? '+' : ''}${program.rateAdjustment.toFixed(3)}%</div>` : ''}
                </div>
                <div style="margin-top: 8px; font-size: 0.85rem; color: #888;">
                    <div><strong>Income Limits:</strong> $${program.incomeLimit}</div>
                    <div style="margin-top: 4px;"><strong>Type:</strong> ${program.dpaType === 'grant' ? 'Grant' : program.dpaType === 'secondLoan' ? 'Second Loan' : 'Deferred Loan'}</div>
                </div>
            </div>
        `;
    });
    
    content.innerHTML = html;
    
    // Re-filter by credit score if one is selected
    const creditScore = document.getElementById('creditScore').value;
    if (creditScore) {
        filterProgramsByCreditScore(parseInt(creditScore));
    }
}

// Global variable to track selected programs (can be multiple)
let selectedPrograms = [];

// Select DPA program (called from onclick in HTML)
function selectDPAProgram(programId) {
    const state = document.getElementById('state').value;
    if (!state) return;
    
    const stateData = STATE_PROGRAMS[state];
    const program = stateData.programs.find(p => p.id === programId);
    
    if (!program) return;
    
    // Check if program is energy efficient (can be combined)
    const isEnergyEfficient = programId === 'nh_energy';
    const clickedElement = document.querySelector(`[data-program-id="${programId}"]`);
    
    if (clickedElement.classList.contains('selected')) {
        // Deselect if already selected
        selectedPrograms = selectedPrograms.filter(id => id !== programId);
        clickedElement.classList.remove('selected');
        
        if (selectedPrograms.length === 0) {
            document.getElementById('dpaSelectedCard').style.display = 'none';
            document.getElementById('dpaAmount').value = 0;
            updateDownPaymentSummary();
            return;
        }
    } else {
        // If selecting a non-energy efficient program, clear all selections first
        if (!isEnergyEfficient) {
            document.querySelectorAll('.state-program-item').forEach(item => {
                item.classList.remove('selected');
            });
            selectedPrograms = [];
        } else {
            // If selecting energy efficient, remove any non-energy efficient programs
            const nonEnergyPrograms = selectedPrograms.filter(id => id !== 'nh_energy');
            if (nonEnergyPrograms.length > 0) {
                // Can only combine with one main program
                const mainProgram = nonEnergyPrograms[0];
                selectedPrograms = [mainProgram];
                document.querySelectorAll('.state-program-item').forEach(item => {
                    const itemId = item.getAttribute('data-program-id');
                    if (itemId !== mainProgram) {
                        item.classList.remove('selected');
                    }
                });
            }
        }
        
        // Add the clicked program
        selectedPrograms.push(programId);
        clickedElement.classList.add('selected');
    }
    
    // Show selected card and build combined info
    displaySelectedPrograms(state);
}

// Display selected programs
function displaySelectedPrograms(state) {
    const selectedCard = document.getElementById('dpaSelectedCard');
    const dpaInfo = document.getElementById('dpaInfo');
    
    if (selectedPrograms.length === 0) {
        selectedCard.style.display = 'none';
        return;
    }
    
    selectedCard.style.display = 'block';
    
    const stateData = STATE_PROGRAMS[state];
    const programs = selectedPrograms.map(id => stateData.programs.find(p => p.id === id));
    
    // Build combined info display
    let infoHTML = '';
    let totalDPA = 0;
    let effectiveRateAdjustment = 0;
    let combinedType = 'grant';
    
    if (programs.length === 1) {
        const program = programs[0];
        infoHTML = `<h5 style="margin-bottom: 15px;">${program.name}</h5>`;
        totalDPA = program.dpaMax;
        effectiveRateAdjustment = program.rateAdjustment;
        combinedType = program.dpaType;
        
        if (program.dpaMax > 0) {
            infoHTML += `
                <div class="info-item">
                    <span class="info-label">Max Assistance:</span>
                    <span class="info-value">${formatCurrency(program.dpaMax)}</span>
                </div>
            `;
        }
        
        if (program.monthlyCost > 0) {
            infoHTML += `
                <div class="info-item">
                    <span class="info-label">Monthly Cost:</span>
                    <span class="info-value" style="color: #dc3545; font-weight: 600;">$${program.monthlyCost}</span>
                </div>
            `;
        }
        
        infoHTML += `
            <div class="info-item">
                <span class="info-label">Type:</span>
                <span class="info-value">${program.dpaType === 'grant' ? 'Grant (No Repayment)' : program.dpaType === 'secondLoan' ? 'Second Loan' : 'Deferred Loan'}</span>
            </div>
        `;
        
        if (program.dpaInterestRate > 0) {
            infoHTML += `
                <div class="info-item">
                    <span class="info-label">DPA Interest Rate:</span>
                    <span class="info-value">${program.dpaInterestRate.toFixed(3)}%</span>
                </div>
            `;
        }
        
        if (program.rateAdjustment !== 0) {
            infoHTML += `
                <div class="info-item">
                    <span class="info-label">Primary Rate Adjustment:</span>
                    <span class="info-value" style="color: ${program.rateAdjustment > 0 ? '#dc3545' : '#28a745'};">${program.rateAdjustment > 0 ? '+' : ''}${program.rateAdjustment.toFixed(3)}%</span>
                </div>
            `;
        }
        
        infoHTML += `
            <div class="info-item">
                <span class="info-label">Income Limits:</span>
                <span class="info-value">$${program.incomeLimit}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Requirements:</span>
                <span class="info-value" style="text-align: right; font-size: 0.9rem;">${program.requirements}</span>
            </div>
        `;
        
        if (program.brokerNote) {
            infoHTML += `
                <div class="info-item" style="margin-top: 10px; padding: 10px; background: #fff3cd; border-radius: 6px; border-left: 3px solid #ffc107;">
                    <span style="color: #856404; font-size: 0.9rem; font-style: italic;">💼 ${program.brokerNote}</span>
                </div>
            `;
        }
    } else {
        // Multiple programs combined
        infoHTML = `<h5 style="margin-bottom: 15px;">Combined Programs</h5>`;
        
        let totalMonthlyCost = 0;
        programs.forEach(program => {
            totalDPA += program.dpaMax;
            effectiveRateAdjustment += program.rateAdjustment;
            totalMonthlyCost += (program.monthlyCost || 0);
            infoHTML += `<div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 6px;">
                <strong>${program.name}</strong>: ${formatCurrency(program.dpaMax)}
                ${program.monthlyCost > 0 ? `<br><span style="color: #dc3545;">$${program.monthlyCost}/month</span>` : ''}
            </div>`;
        });
        
        infoHTML += `
            <div class="info-item" style="margin-top: 15px; border-top: 2px solid #667eea; padding-top: 10px;">
                <span class="info-label"><strong>Total Max Assistance:</strong></span>
                <span class="info-value"><strong>${formatCurrency(totalDPA)}</strong></span>
            </div>
        `;
        
        if (totalMonthlyCost > 0) {
            infoHTML += `
                <div class="info-item">
                    <span class="info-label"><strong>Total Monthly Cost:</strong></span>
                    <span class="info-value" style="color: #dc3545; font-weight: 600;"><strong>$${totalMonthlyCost}</strong></span>
                </div>
            `;
        }
        
        if (effectiveRateAdjustment !== 0) {
            infoHTML += `
                <div class="info-item">
                    <span class="info-label">Combined Rate Adjustment:</span>
                    <span class="info-value" style="color: ${effectiveRateAdjustment > 0 ? '#dc3545' : '#28a745'};">${effectiveRateAdjustment > 0 ? '+' : ''}${effectiveRateAdjustment.toFixed(3)}%</span>
                </div>
            `;
        }
    }
    
    dpaInfo.innerHTML = infoHTML;
    
    // Set default DPA amount to total max
    document.getElementById('dpaAmount').value = totalDPA.toLocaleString('en-US');
    
    // Update down payment summary
    updateDownPaymentSummary();
    
    // Scroll to selected program card
    selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Clear DPA selection
function clearDPASelection() {
    selectedPrograms = [];
    
    // Hide selected card
    document.getElementById('dpaSelectedCard').style.display = 'none';
    
    // Remove selection highlighting
    document.querySelectorAll('.state-program-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Reset DPA amount
    document.getElementById('dpaAmount').value = 0;
    
    // Update down payment summary
    updateDownPaymentSummary();
}

// Toggle tax calculation method
function toggleTaxMethod() {
    const method = document.getElementById('taxMethod').value;
    const rateGroup = document.getElementById('taxRateGroup');
    const amountGroup = document.getElementById('taxAmountGroup');
    
    if (method === 'rate') {
        rateGroup.style.display = 'block';
        amountGroup.style.display = 'none';
    } else {
        rateGroup.style.display = 'none';
        amountGroup.style.display = 'block';
    }
}

// Toggle flood insurance visibility
function toggleFloodInsurance() {
    const floodZone = document.getElementById('floodZone').value;
    const floodGroup = document.getElementById('floodInsuranceGroup');
    
    if (floodZone === 'ae' || floodZone === 'a') {
        floodGroup.style.display = 'block';
    } else {
        floodGroup.style.display = 'none';
        document.getElementById('floodInsurance').value = 0;
    }
}

// Toggle septic maintenance visibility
function toggleSepticReserve() {
    const waterSource = document.getElementById('waterSource').value;
    const septicGroup = document.getElementById('septicGroup');
    
    if (waterSource === 'public_septic' || waterSource === 'well_septic') {
        septicGroup.style.display = 'block';
    } else {
        septicGroup.style.display = 'none';
        document.getElementById('septicReserve').value = 0;
    }
}

// Format number input with commas on blur
function formatNumberInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.addEventListener('blur', function(e) {
        const rawValue = this.value.replace(/,/g, '').trim();
        if (rawValue && !isNaN(rawValue)) {
            const num = parseFloat(rawValue);
            if (num > 0) {
                this.value = num.toLocaleString('en-US');
            }
        }
    });
    
    input.addEventListener('focus', function(e) {
        // Remove commas when user focuses to edit
        if (this.value) {
            this.value = this.value.replace(/,/g, '');
        }
    });
}

// Handle credit score selection
function handleCreditScoreChange() {
    const creditScore = document.getElementById('creditScore').value;
    const loanType = document.getElementById('loanType').value;
    const helpText = document.getElementById('creditScoreHelp');
    const interestRateInput = document.getElementById('interestRate');
    const baseRate = 6.5; // Current market baseline
    
    if (!creditScore) {
        helpText.style.display = 'none';
        return;
    }
    
    const scoreData = CREDIT_SCORE_ADJUSTMENTS[creditScore];
    
    // Check if credit score is valid for loan type
    if (loanType === 'conventional' && !scoreData.minConventional) {
        helpText.style.display = 'block';
        helpText.style.color = '#dc3545';
        helpText.textContent = `⚠ Credit score too low for conventional loans. FHA loan required (minimum 580 credit score).`;
        document.getElementById('loanType').value = 'fha';
        handleLoanTypeChange();
        return;
    }
    
    // FHA rate adjustment (slightly different from conventional)
    let rateAdjustment = scoreData.rateAdjustment;
    if (loanType === 'fha') {
        rateAdjustment += 0.25; // FHA loans typically 0.25% higher
    }
    
    const adjustedRate = baseRate + rateAdjustment;
    
    // Update interest rate
    interestRateInput.value = adjustedRate.toFixed(3);
    
    // Show helpful message
    helpText.style.display = 'block';
    helpText.style.color = scoreData.color;
    
    if (scoreData.rateAdjustment < 0) {
        helpText.textContent = `✓ Excellent! Your credit score qualifies you for ${Math.abs(scoreData.rateAdjustment).toFixed(2)}% below market rate.`;
    } else if (scoreData.rateAdjustment === 0) {
        helpText.textContent = `✓ Good credit score - market rate applied.`;
    } else {
        helpText.textContent = `⚠ Your credit score adds ${rateAdjustment.toFixed(2)}% to the base rate. Improving your score could save you money!`;
    }
    
    // Update PMI rate if applicable
    if (document.getElementById('requiresPMI').checked) {
        updateDownPaymentSummary();
    }
    
    // Filter DPA programs based on credit score
    filterProgramsByCreditScore(parseInt(creditScore));
}

// Handle loan type change
function handleLoanTypeChange() {
    const loanType = document.getElementById('loanType').value;
    const loanTypeHelp = document.getElementById('loanTypeHelp');
    const pmiLabel = document.getElementById('pmiLabel');
    const fhaSection = document.getElementById('fhaUpfrontMIPSection');
    
    if (loanType === 'fha') {
        loanTypeHelp.textContent = 'FHA: Lower credit scores (580+), 3.5% minimum down, higher insurance costs';
        loanTypeHelp.style.color = '#856404';
        pmiLabel.textContent = 'Annual MIP';
        fhaSection.style.display = 'block';
    } else {
        loanTypeHelp.textContent = 'Conventional: Better rates, requires 620+ credit, 3-20% down payment';
        loanTypeHelp.style.color = '#666';
        pmiLabel.textContent = 'PMI';
        fhaSection.style.display = 'none';
    }
    
    // Revalidate credit score for loan type
    const creditScore = document.getElementById('creditScore').value;
    if (creditScore) {
        handleCreditScoreChange();
    }
    
    // Update down payment summary
    updateDownPaymentSummary();
}

// Loan type comparison modal handlers
function openLoanComparison() {
    const modal = document.getElementById('loanComparisonModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Add hover effect to close button
    const closeBtn = document.getElementById('closeLoanComparison');
    closeBtn.addEventListener('mouseenter', function() {
        this.style.background = 'white';
        this.style.color = '#667eea';
        this.style.transform = 'scale(1.1)';
    });
    closeBtn.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(255,255,255,0.2)';
        this.style.color = 'white';
        this.style.transform = 'scale(1)';
    });
    
    // Add hover effect to bottom button
    const bottomBtn = document.getElementById('closeLoanComparisonBottom');
    bottomBtn.addEventListener('mouseenter', function() {
        this.style.background = '#667eea';
        this.style.color = 'white';
        this.style.transform = 'scale(1.05)';
    });
    bottomBtn.addEventListener('mouseleave', function() {
        this.style.background = 'white';
        this.style.color = '#667eea';
        this.style.transform = 'scale(1)';
    });
}

function closeLoanComparison() {
    document.getElementById('loanComparisonModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Filter DPA programs based on credit score
function filterProgramsByCreditScore(creditScore) {
    const state = document.getElementById('state').value;
    if (!state) return;
    
    const stateData = STATE_PROGRAMS[state];
    const programItems = document.querySelectorAll('.state-program-item');
    
    programItems.forEach(item => {
        const programId = item.getAttribute('data-program-id');
        const program = stateData.programs.find(p => p.id === programId);
        
        if (program && program.minCreditScore) {
            if (creditScore < program.minCreditScore) {
                item.style.opacity = '0.4';
                item.style.pointerEvents = 'none';
                item.style.cursor = 'not-allowed';
                
                // Add notice
                let notice = item.querySelector('.credit-notice');
                if (!notice) {
                    notice = document.createElement('div');
                    notice.className = 'credit-notice';
                    notice.style.cssText = 'background: #dc3545; color: white; padding: 5px 10px; border-radius: 4px; margin-top: 8px; font-size: 0.85rem;';
                    notice.innerHTML = `⚠ Requires ${program.minCreditScore}+ credit score`;
                    item.appendChild(notice);
                }
            } else {
                item.style.opacity = '1';
                item.style.pointerEvents = 'auto';
                item.style.cursor = 'pointer';
                
                // Remove notice if exists
                const notice = item.querySelector('.credit-notice');
                if (notice) notice.remove();
            }
        }
    });
}

// Toggle utility/cost inclusion checkbox
function toggleUtilityInclusion(fieldName) {
    const checkbox = document.getElementById(`${fieldName}Included`);
    const input = document.getElementById(fieldName);
    
    if (!checkbox || !input) return;
    
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            input.value = '0';
            input.disabled = true;
            input.style.background = '#e9ecef';
            input.style.color = '#6c757d';
        } else {
            input.disabled = false;
            input.style.background = 'white';
            input.style.color = 'black';
        }
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // State selection
    document.getElementById('state').addEventListener('change', updateStatePrograms);
    
    // Credit score selection
    document.getElementById('creditScore').addEventListener('change', handleCreditScoreChange);
    
    // Loan type selection
    document.getElementById('loanType').addEventListener('change', handleLoanTypeChange);
    
    // Loan comparison modal
    document.getElementById('loanTypeComparisonLink').addEventListener('click', function(e) {
        e.preventDefault();
        openLoanComparison();
    });
    document.getElementById('closeLoanComparison').addEventListener('click', closeLoanComparison);
    document.getElementById('closeLoanComparisonBottom').addEventListener('click', closeLoanComparison);
    
    // Close modal with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('loanComparisonModal').style.display === 'block') {
            closeLoanComparison();
        }
    });
    
    // DON'T close when clicking the modal background (removed that functionality)
    
    // Clear DPA button
    document.getElementById('clearDPABtn').addEventListener('click', clearDPASelection);
    
    // Tax method toggle
    document.getElementById('taxMethod').addEventListener('change', toggleTaxMethod);
    
    // Flood zone toggle
    document.getElementById('floodZone').addEventListener('change', toggleFloodInsurance);
    
    // Water source toggle
    document.getElementById('waterSource').addEventListener('change', toggleSepticReserve);
    
    // Format number inputs with commas
    formatNumberInput('homePrice');
    formatNumberInput('cashDownPayment');
    formatNumberInput('dpaAmount');
    formatNumberInput('propertyTaxAmount');
    formatNumberInput('homeInsurance');
    formatNumberInput('floodInsurance');
    
    // Down payment summary update
    document.getElementById('homePrice').addEventListener('input', updateDownPaymentSummary);
    document.getElementById('cashDownPayment').addEventListener('input', updateDownPaymentSummary);
    document.getElementById('dpaAmount').addEventListener('input', updateDownPaymentSummary);
    document.getElementById('propertyType').addEventListener('change', updateDownPaymentSummary);
    
    // Auto-calculate insurance toggle
    document.getElementById('autoCalculateInsurance').addEventListener('change', updateHomeInsurance);
    
    // Toggle conditional sections
    toggleSection('requiresPMI', 'pmiDetails');
    toggleSection('hasHOA', 'hoaDetails');
    
    // Utility inclusion toggles
    toggleUtilityInclusion('electricity');
    toggleUtilityInclusion('heating');
    toggleUtilityInclusion('water');
    toggleUtilityInclusion('internet');
    toggleUtilityInclusion('trash');
    
    // Additional costs inclusion toggles
    toggleUtilityInclusion('maintenance');
    toggleUtilityInclusion('lawnCare');
    toggleUtilityInclusion('snowRemoval');
    toggleUtilityInclusion('parking');
    toggleUtilityInclusion('storage');
    
    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', calculatePayment);
    
    // Copy button
    document.getElementById('copySummaryBtn').addEventListener('click', copySummaryToClipboard);
    
    // Initial update
    updateDownPaymentSummary();
    updateHomeInsurance();
}

// Main calculation function
function calculatePayment() {
    // Get all input values
    const state = document.getElementById('state').value;
    
    // Build full address
    const addressLine1 = document.getElementById('addressLine1').value.trim();
    const addressLine2 = document.getElementById('addressLine2').value.trim();
    const city = document.getElementById('city').value.trim();
    const stateText = state ? (state === 'MA' ? 'Massachusetts' : 'New Hampshire') : '';
    const zipCode = document.getElementById('zipCode').value.trim();
    
    let fullAddress = addressLine1;
    if (addressLine2) fullAddress += `, ${addressLine2}`;
    if (city) fullAddress += `, ${city}`;
    if (stateText) fullAddress += `, ${stateText}`;
    if (zipCode) fullAddress += ` ${zipCode}`;
    
    const homePrice = parseFloat(document.getElementById('homePrice').value.replace(/,/g, '')) || 0;
    const cashDownPayment = parseFloat(document.getElementById('cashDownPayment').value.replace(/,/g, '')) || 0;
    let interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const loanTerm = parseInt(document.getElementById('loanTerm').value) || 30;
    const loanType = document.getElementById('loanType').value;
    
    // DPA values
    let hasDPA = false;
    let dpaAmount = 0;
    let dpaType = 'grant';
    let dpaProgram = '';
    let dpaInterestRate = 0;
    let rateIncrease = 0;
    
    if (selectedPrograms.length > 0 && state) {
        const stateData = STATE_PROGRAMS[state];
        const programs = selectedPrograms.map(id => stateData.programs.find(p => p.id === id)).filter(p => p);
        
        if (programs.length > 0) {
            hasDPA = true;
            dpaAmount = parseFloat(document.getElementById('dpaAmount').value.replace(/,/g, '')) || 0;
            
            // Combine program details
            dpaProgram = programs.map(p => p.name).join(' + ');
            
            // For combined programs, use the primary (non-energy) program's type
            const primaryProgram = programs.find(p => p.id !== 'nh_energy') || programs[0];
            dpaType = primaryProgram.dpaType;
            dpaInterestRate = primaryProgram.dpaInterestRate;
            
            // Sum rate adjustments
            rateIncrease = programs.reduce((sum, p) => sum + p.rateAdjustment, 0);
        }
    }
    
    // Adjust interest rate if using DPA
    const effectiveInterestRate = interestRate + rateIncrease;
    
    // Calculate actual down payment (cash + DPA)
    const totalDownPayment = cashDownPayment + dpaAmount;
    let loanAmount = homePrice - totalDownPayment;
    const downPaymentPercent = totalDownPayment / homePrice * 100;
    
    // FHA Upfront MIP (1.75% added to loan)
    let upfrontMIP = 0;
    if (loanType === 'fha') {
        upfrontMIP = loanAmount * 0.0175;
        loanAmount += upfrontMIP; // Add to loan balance
    }
    
    // Property tax and insurance
    const taxMethod = document.getElementById('taxMethod').value;
    let annualPropertyTax = 0;
    
    if (taxMethod === 'rate') {
        const propertyTaxRate = parseFloat(document.getElementById('propertyTaxRate').value) || 0;
        annualPropertyTax = homePrice * (propertyTaxRate / 100);
    } else {
        annualPropertyTax = parseFloat(document.getElementById('propertyTaxAmount').value.replace(/,/g, '')) || 0;
    }
    
    const monthlyPropertyTax = annualPropertyTax / 12;
    
    const annualHomeInsurance = parseFloat(document.getElementById('homeInsurance').value.replace(/,/g, '')) || 0;
    const monthlyHomeInsurance = annualHomeInsurance / 12;
    
    // Flood insurance
    const annualFloodInsurance = parseFloat(document.getElementById('floodInsurance').value.replace(/,/g, '')) || 0;
    const monthlyFloodInsurance = annualFloodInsurance / 12;
    
    // PMI/MIP
    const requiresPMI = document.getElementById('requiresPMI').checked;
    let pmiRate = 0.5; // Default
    
    // Adjust PMI/MIP rate based on loan type, credit score, and down payment
    const creditScore = document.getElementById('creditScore').value;
    
    if (loanType === 'fha') {
        // FHA MIP calculation
        pmiRate = calculateFHAMIP(loanAmount - upfrontMIP, downPaymentPercent, loanTerm);
    } else {
        // Conventional PMI
        if (creditScore && CREDIT_SCORE_ADJUSTMENTS[creditScore]) {
            pmiRate = CREDIT_SCORE_ADJUSTMENTS[creditScore].pmiRate;
            
            // Adjust based on down payment
            if (downPaymentPercent < 5) {
                pmiRate += 0.2;
            } else if (downPaymentPercent < 10) {
                pmiRate += 0.1;
            } else if (downPaymentPercent >= 15) {
                pmiRate -= 0.1;
            }
        } else {
            pmiRate = parseFloat(document.getElementById('pmiRate').value) || 0.5;
        }
    }
    
    const monthlyPMI = requiresPMI ? (loanAmount * (pmiRate / 100) / 12) : 0;
    
    // HOA
    const hasHOA = document.getElementById('hasHOA').checked;
    let monthlyHOA = 0;
    let hoaIncludes = '';
    if (hasHOA) {
        monthlyHOA = parseFloat(document.getElementById('hoaFee').value) || 0;
        hoaIncludes = document.getElementById('hoaIncludes').value;
    }
    
    // Utilities - check if included
    const electricity = document.getElementById('electricityIncluded').checked ? 0 : (parseFloat(document.getElementById('electricity').value) || 0);
    const heating = document.getElementById('heatingIncluded').checked ? 0 : (parseFloat(document.getElementById('heating').value) || 0);
    const water = document.getElementById('waterIncluded').checked ? 0 : (parseFloat(document.getElementById('water').value) || 0);
    const internet = document.getElementById('internetIncluded').checked ? 0 : (parseFloat(document.getElementById('internet').value) || 0);
    const trash = document.getElementById('trashIncluded').checked ? 0 : (parseFloat(document.getElementById('trash').value) || 0);
    
    // Additional costs - check if included
    const maintenance = document.getElementById('maintenanceIncluded').checked ? 0 : (parseFloat(document.getElementById('maintenance').value) || 0);
    const lawnCare = document.getElementById('lawnCareIncluded').checked ? 0 : (parseFloat(document.getElementById('lawnCare').value) || 0);
    const snowRemoval = document.getElementById('snowRemovalIncluded').checked ? 0 : (parseFloat(document.getElementById('snowRemoval').value) || 0);
    const septicReserve = parseFloat(document.getElementById('septicReserve').value) || 0;
    const parking = document.getElementById('parkingIncluded').checked ? 0 : (parseFloat(document.getElementById('parking').value) || 0);
    const storage = document.getElementById('storageIncluded').checked ? 0 : (parseFloat(document.getElementById('storage').value) || 0);
    const other = parseFloat(document.getElementById('other').value) || 0;
    
    // Calculate mortgage payment (P&I)
    const monthlyPI = calculateMortgagePayment(loanAmount, effectiveInterestRate, loanTerm);
    
    // Calculate DPA payment if it's a loan type
    let monthlyDPAPayment = 0;
    if (hasDPA && dpaType !== 'grant' && dpaAmount > 0) {
        if (dpaType === 'secondLoan') {
            monthlyDPAPayment = calculateMortgagePayment(dpaAmount, dpaInterestRate, loanTerm);
        }
        // For deferred loans, payment is typically $0 until sale/refinance
    }
    
    // Calculate totals
    const housingSubtotal = monthlyPI + monthlyDPAPayment + monthlyPropertyTax + 
                           monthlyHomeInsurance + monthlyFloodInsurance + monthlyPMI + monthlyHOA;
    const utilitiesSubtotal = electricity + heating + water + internet + trash;
    const otherSubtotal = maintenance + lawnCare + snowRemoval + septicReserve + parking + storage + other;
    const totalMonthly = housingSubtotal + utilitiesSubtotal + otherSubtotal;
    
    // Calculate total interest over life of loan
    const totalPayments = monthlyPI * loanTerm * 12;
    const totalInterest = totalPayments - loanAmount;
    const totalPaidOverLife = totalPayments + (monthlyDPAPayment * loanTerm * 12);
    
    // Update display
    displayResults(
        state,
        fullAddress,
        totalMonthly,
        monthlyPI,
        monthlyDPAPayment,
        monthlyPropertyTax,
        annualPropertyTax,
        monthlyHomeInsurance,
        monthlyFloodInsurance,
        monthlyPMI,
        monthlyHOA,
        electricity,
        heating,
        water,
        internet,
        trash,
        maintenance,
        lawnCare,
        snowRemoval,
        septicReserve,
        parking,
        storage,
        other,
        housingSubtotal,
        utilitiesSubtotal,
        otherSubtotal,
        homePrice,
        cashDownPayment,
        totalDownPayment,
        loanAmount,
        interestRate,
        effectiveInterestRate,
        loanTerm,
        totalInterest,
        totalPaidOverLife,
        hasDPA,
        dpaAmount,
        dpaType,
        dpaProgram,
        requiresPMI,
        hasHOA,
        monthlyHOA,
        hoaIncludes
    );
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display results
function displayResults(
    state,
    address,
    totalMonthly,
    monthlyPI,
    monthlyDPAPayment,
    monthlyPropertyTax,
    annualPropertyTax,
    monthlyHomeInsurance,
    monthlyFloodInsurance,
    monthlyPMI,
    monthlyHOA,
    electricity,
    heating,
    water,
    internet,
    trash,
    maintenance,
    lawnCare,
    snowRemoval,
    septicReserve,
    parking,
    storage,
    other,
    housingSubtotal,
    utilitiesSubtotal,
    otherSubtotal,
    homePrice,
    cashDownPayment,
    totalDownPayment,
    loanAmount,
    interestRate,
    effectiveInterestRate,
    loanTerm,
    totalInterest,
    totalPaidOverLife,
    hasDPA,
    dpaAmount,
    dpaType,
    dpaProgram,
    requiresPMI,
    hasHOA,
    actualMonthlyHOA,
    hoaIncludes
) {
    // Show results section
    document.getElementById('results').style.display = 'block';
    
    // Total payment
    document.getElementById('totalPayment').textContent = formatCurrency(totalMonthly);
    
    // Mortgage components
    document.getElementById('principalInterest').textContent = formatCurrencyDetailed(monthlyPI);
    
    // DPA payment
    if (hasDPA && monthlyDPAPayment > 0) {
        document.getElementById('dpaPaymentRow').style.display = 'flex';
        document.getElementById('dpaPayment').textContent = formatCurrencyDetailed(monthlyDPAPayment);
    } else {
        document.getElementById('dpaPaymentRow').style.display = 'none';
    }
    
    document.getElementById('propertyTax').textContent = formatCurrencyDetailed(monthlyPropertyTax);
    document.getElementById('insurance').textContent = formatCurrencyDetailed(monthlyHomeInsurance);
    
    // Flood insurance (only show if > 0)
    if (monthlyFloodInsurance > 0) {
        // We'll add this row to the display
    }
    
    // PMI
    if (requiresPMI) {
        document.getElementById('pmiRow').style.display = 'flex';
        document.getElementById('pmi').textContent = formatCurrencyDetailed(monthlyPMI);
    } else {
        document.getElementById('pmiRow').style.display = 'none';
    }
    
    // HOA
    if (hasHOA) {
        document.getElementById('hoaRow').style.display = 'flex';
        document.getElementById('hoaAmount').textContent = formatCurrencyDetailed(monthlyHOA);
    } else {
        document.getElementById('hoaRow').style.display = 'none';
    }
    
    document.getElementById('housingSubtotal').textContent = formatCurrency(housingSubtotal);
    
    // Utilities
    document.getElementById('electricityAmount').textContent = formatCurrencyDetailed(electricity);
    document.getElementById('heatingAmount').textContent = formatCurrencyDetailed(heating);
    document.getElementById('waterAmount').textContent = formatCurrencyDetailed(water);
    document.getElementById('internetAmount').textContent = formatCurrencyDetailed(internet);
    document.getElementById('trashAmount').textContent = formatCurrencyDetailed(trash);
    document.getElementById('utilitiesSubtotal').textContent = formatCurrency(utilitiesSubtotal);
    
    // Other costs
    document.getElementById('maintenanceAmount').textContent = formatCurrencyDetailed(maintenance);
    document.getElementById('otherAmount').textContent = formatCurrencyDetailed(lawnCare + snowRemoval + septicReserve + parking + storage + other);
    document.getElementById('otherSubtotal').textContent = formatCurrency(otherSubtotal);
    
    // Loan summary
    document.getElementById('summaryHomePrice').textContent = formatCurrency(homePrice);
    document.getElementById('summaryDownPayment').textContent = formatCurrency(totalDownPayment);
    document.getElementById('summaryLoanAmount').textContent = formatCurrency(loanAmount);
    document.getElementById('summaryInterestRate').textContent = effectiveInterestRate.toFixed(3) + '%';
    document.getElementById('summaryLoanTerm').textContent = loanTerm + ' years';
    document.getElementById('summaryTotalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('summaryTotalPaid').textContent = formatCurrency(totalPaidOverLife);
    
    // Generate copyable summary
    generateCopyableSummary({
        state,
        address,
        homePrice,
        cashDownPayment,
        totalDownPayment,
        loanAmount,
        interestRate,
        effectiveInterestRate,
        loanTerm,
        loanType: document.getElementById('loanType').value,
        hasDPA,
        dpaAmount,
        dpaType,
        dpaProgram,
        requiresPMI,
        hasHOA,
        monthlyPI,
        monthlyDPAPayment,
        monthlyPropertyTax,
        annualPropertyTax,
        monthlyHomeInsurance,
        monthlyFloodInsurance,
        monthlyPMI,
        actualMonthlyHOA: monthlyHOA,
        hoaIncludes,
        electricity,
        heating,
        water,
        internet,
        trash,
        maintenance,
        lawnCare,
        snowRemoval,
        septicReserve,
        parking,
        storage,
        other,
        housingSubtotal,
        utilitiesSubtotal,
        otherSubtotal,
        totalMonthly,
        totalInterest,
        totalPaidOverLife
    });
}

// Generate copyable summary text
function generateCopyableSummary(data) {
    const stateName = data.state ? STATE_PROGRAMS[data.state].name : 'Not specified';
    const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    let summary = `MORTGAGE CALCULATION SUMMARY
Generated: ${date}

═══════════════════════════════════════════════════════
PROPERTY INFORMATION
═══════════════════════════════════════════════════════
State:           ${stateName}
Address:         ${data.address || 'Not specified'}
Home Price:      ${formatCurrency(data.homePrice)}
Annual Tax:      ${formatCurrency(data.annualPropertyTax)}

═══════════════════════════════════════════════════════
LOAN DETAILS
═══════════════════════════════════════════════════════
Cash Down Payment:  ${formatCurrency(data.cashDownPayment)}${data.hasDPA ? `
DPA Amount:         ${formatCurrency(data.dpaAmount)}` : ''}
Total Down Payment: ${formatCurrency(data.totalDownPayment)} (${((data.totalDownPayment/data.homePrice)*100).toFixed(2)}%)
Loan Amount:        ${formatCurrency(data.loanAmount)}
Interest Rate:      ${data.interestRate.toFixed(3)}%${data.effectiveInterestRate !== data.interestRate ? ` (Effective: ${data.effectiveInterestRate.toFixed(3)}%)` : ''}
Loan Term:          ${data.loanTerm} years
`;

    if (data.hasDPA && data.dpaAmount > 0) {
        summary += `\n--- Down Payment Assistance ---
Program:         ${data.dpaProgram || 'Not specified'}
DPA Amount:      ${formatCurrency(data.dpaAmount)}
DPA Type:        ${data.dpaType === 'grant' ? 'Grant (No Repayment)' : data.dpaType === 'secondLoan' ? 'Second Loan' : 'Deferred Payment Loan'}
${data.monthlyDPAPayment > 0 ? `Monthly Payment: ${formatCurrencyDetailed(data.monthlyDPAPayment)}` : ''}
`;
    }

    summary += `
═══════════════════════════════════════════════════════
MONTHLY PAYMENT BREAKDOWN
═══════════════════════════════════════════════════════

🏦 HOUSING COSTS:
Principal & Interest:        ${formatCurrencyDetailed(data.monthlyPI)}`;

    if (data.hasDPA && data.monthlyDPAPayment > 0) {
        summary += `
DPA Loan Payment:            ${formatCurrencyDetailed(data.monthlyDPAPayment)}`;
    }

    summary += `
Property Tax:                ${formatCurrencyDetailed(data.monthlyPropertyTax)}
Homeowners Insurance:        ${formatCurrencyDetailed(data.monthlyHomeInsurance)}`;

    if (data.monthlyFloodInsurance > 0) {
        summary += `
Flood Insurance:             ${formatCurrencyDetailed(data.monthlyFloodInsurance)}`;
    }

    if (data.requiresPMI) {
        const insuranceLabel = data.loanType === 'fha' ? 'FHA MIP' : 'PMI';
        summary += `
${insuranceLabel}:                   ${formatCurrencyDetailed(data.monthlyPMI)}`;
    }

    if (data.hasHOA) {
        summary += `
HOA Fee:                     ${formatCurrencyDetailed(data.actualMonthlyHOA)}`;
        if (data.hoaIncludes) {
            summary += `
  Includes: ${data.hoaIncludes}`;
        }
    }

    summary += `
                             ─────────────
Housing Subtotal:            ${formatCurrency(data.housingSubtotal)}

⚡ UTILITIES:
Electricity:                 ${formatCurrencyDetailed(data.electricity)}
Heating/Gas:                 ${formatCurrencyDetailed(data.heating)}
Water & Sewer:               ${formatCurrencyDetailed(data.water)}
Internet:                    ${formatCurrencyDetailed(data.internet)}
Trash:                       ${formatCurrencyDetailed(data.trash)}
                             ─────────────
Utilities Subtotal:          ${formatCurrency(data.utilitiesSubtotal)}

🔧 OTHER COSTS:
Maintenance Reserve:         ${formatCurrencyDetailed(data.maintenance)}`;
    
    if (data.lawnCare > 0) summary += `
Lawn Care/Landscaping:       ${formatCurrencyDetailed(data.lawnCare)}`;
    if (data.snowRemoval > 0) summary += `
Snow Removal:                ${formatCurrencyDetailed(data.snowRemoval)}`;
    if (data.septicReserve > 0) summary += `
Septic Maintenance:          ${formatCurrencyDetailed(data.septicReserve)}`;
    if (data.parking > 0) summary += `
Parking Fee:                 ${formatCurrencyDetailed(data.parking)}`;
    if (data.storage > 0) summary += `
Storage Fee:                 ${formatCurrencyDetailed(data.storage)}`;
    if (data.other > 0) summary += `
Other Costs:                 ${formatCurrencyDetailed(data.other)}`;
    
    summary += `
                             ─────────────
Other Subtotal:              ${formatCurrency(data.otherSubtotal)}

═══════════════════════════════════════════════════════
💰 TOTAL MONTHLY PAYMENT:    ${formatCurrency(data.totalMonthly)}
═══════════════════════════════════════════════════════

LONG-TERM COSTS:
Total Interest Paid:         ${formatCurrency(data.totalInterest)}
Total Paid Over Life:        ${formatCurrency(data.totalPaidOverLife)}

═══════════════════════════════════════════════════════
`;

    document.getElementById('summaryText').textContent = summary;
}

// Copy summary to clipboard
function copySummaryToClipboard() {
    const summaryText = document.getElementById('summaryText').textContent;
    const button = document.getElementById('copySummaryBtn');
    
    navigator.clipboard.writeText(summaryText).then(() => {
        const originalText = button.textContent;
        button.textContent = '✅ Copied!';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#667eea';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy to clipboard. Please select and copy manually.');
        console.error('Copy failed:', err);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEventListeners);
