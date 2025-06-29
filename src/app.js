import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, AlertCircle, BookOpen, Heart, Home, MapPin } from 'lucide-react';

// Import components
import BudgetChallenge from './components/BudgetChallenge';
import HealthcareCostScenarios from './components/HealthcareCosts';
import EducationCostBarriers from './components/EducationBarriers';
import RuralUrbanComparison from './components/RuralUrbanComparison';
import IntergenerationalPovertyTrap from './components/IntergenerationalPoverty';
import DataSources from './components/DataSources';

function App() {
  const [step, setStep] = useState(1);
  const [currentFeature, setCurrentFeature] = useState('overview');
  const [userData, setUserData] = useState({
    monthlyIncome: '',
    savings: '',
    disposableIncome: '',
    expenditure: '',
    debt: '',
    perception: ''
  });
  const [results, setResults] = useState(null);
  const [showReveal, setShowReveal] = useState(false);

  // Latest 2023-24 Indian income distribution data
  const incomeDistribution = [
    { bracket: 'Below ₹3k', population: 27.5, color: '#dc2626', min: 0, max: 3000, description: 'Extreme poverty line' },
    { bracket: '₹3k-9k', population: 22.5, color: '#ea580c', min: 3000, max: 9000, description: 'Below median income' },
    { bracket: '₹9k-15k', population: 28, color: '#d97706', min: 9000, max: 15000, description: 'Around median income' },
    { bracket: '₹15k-25k', population: 12, color: '#eab308', min: 15000, max: 25000, description: 'Lower middle class' },
    { bracket: '₹25k-50k', population: 7, color: '#65a30d', min: 25000, max: 50000, description: 'Middle class' },
    { bracket: '₹50k-1L', population: 2.3, color: '#059669', min: 50000, max: 100000, description: 'Upper middle class' },
    { bracket: '₹1L-2L', population: 0.6, color: '#0284c7', min: 100000, max: 200000, description: 'Upper class' },
    { bracket: '₹2L+', population: 0.1, color: '#7c3aed', min: 200000, max: Infinity, description: 'Elite/Ultra rich' }
  ];

  const calculatePercentile = (income) => {
    let percentile = 0;
    for (let bracket of incomeDistribution) {
      if (income > bracket.max) {
        percentile += bracket.population;
      } else if (income >= bracket.min) {
        const position = (income - bracket.min) / (bracket.max - bracket.min);
        percentile += bracket.population * position;
        break;
      } else {
        break;
      }
    }
    return Math.min(percentile, 99.9);
  };

  const getUserBracket = (income) => {
    for (let bracket of incomeDistribution) {
      if (income >= bracket.min && income < bracket.max) {
        return bracket;
      }
    }
    return incomeDistribution[incomeDistribution.length - 1];
  };

  const getClassLabel = (percentile) => {
    if (percentile < 27.5) return { label: 'Below Poverty Line', color: '#dc2626' };
    if (percentile < 50) return { label: 'Lower Income', color: '#ea580c' };
    if (percentile < 78) return { label: 'Lower Middle Class', color: '#d97706' };
    if (percentile < 90) return { label: 'Middle Class', color: '#eab308' };
    if (percentile < 97) return { label: 'Upper Middle Class', color: '#059669' };
    if (percentile < 99.4) return { label: 'Upper Class', color: '#0284c7' };
    return { label: 'Elite/Ultra Rich', color: '#7c3aed' };
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const calculateResults = () => {
    const income = parseInt(userData.monthlyIncome);
    const percentile = calculatePercentile(income);
    const bracket = getUserBracket(income);
    const classInfo = getClassLabel(percentile);
    
    const populationAbove = 100 - percentile;
    const peopleAbove = Math.round((populationAbove / 100) * 1440000000);
    
    setResults({
      income,
      percentile,
      bracket,
      classInfo,
      populationAbove,
      peopleAbove,
      isReallyMiddleClass: percentile >= 50 && percentile < 90,
      surpriseFacts: generateSurpriseFacts(income, percentile)
    });
    setStep(3);
  };

  const generateSurpriseFacts = (income, percentile) => {
    const facts = [];
    
    if (income >= 3000 && percentile > 27.5) {
      facts.push(`You earn more than ${(27.5).toFixed(1)}% of Indians (above extreme poverty line)`);
    }
    
    if (income >= 9000 && percentile > 50) {
      facts.push(`Your income is above the median - you earn more than half of all Indians`);
    }
    
    if (income >= 15000 && percentile > 78) {
      facts.push(`You're in the top 22% of income earners in India`);
    }
    
    if (income >= 25000) {
      facts.push(`Your monthly income is higher than what 90% of Indians earn`);
    }
    
    if (income >= 50000) {
      facts.push(`You're in the top 3% - only 43 million Indians earn this much`);
    }
    
    if (income >= 100000) {
      facts.push(`You're in the top 1% of income earners in India`);
    }

    if (income >= 25000 && userData.perception === 'Middle Class') {
      facts.push(`Reality Check: You identify as "middle class" but you're actually in the top 10% of earners`);
    }
    
    if (income >= 50000 && userData.perception.includes('Middle')) {
      facts.push(`Major Reality Check: You're not middle class - you're in the top 3% of all Indians`);
    }

    return facts;
  };

  const chartData = incomeDistribution.map((bracket, index) => ({
    ...bracket,
    isUser: results && results.bracket.bracket === bracket.bracket,
    order: index
  }));

  const features = [
    { id: 'overview', name: 'Income Distribution', icon: TrendingUp },
    { id: 'budget', name: 'Budget Challenge', icon: DollarSign },
    { id: 'healthcare', name: 'Healthcare Costs', icon: Heart },
    { id: 'education', name: 'Education Barriers', icon: BookOpen },
    { id: 'rural-urban', name: 'Rural vs Urban', icon: MapPin },
    { id: 'poverty-trap', name: 'Poverty Cycle', icon: Users },
    { id: 'sources', name: 'Data Sources', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The Real Middle
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Think you're middle class? Discover where you really stand in India's income distribution. 
            An interactive reality check about economic inequality and its impact on Indian society.
          </p>
        </div>

        {step === 1 && (
          <div className="card">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              What economic class do you think you belong to?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Below Poverty Line', 'Lower Class', 'Lower Middle Class', 'Middle Class', 'Upper Middle Class', 'Upper Class'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    handleInputChange('perception', option);
                    setStep(2);
                  }}
                  className="p-4 bg-slate-700 border border-slate-600 rounded-lg hover:border-amber-400 hover:bg-slate-600 transition-all duration-200 font-medium text-white"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Please provide your financial details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Monthly Income (₹) *</label>
                <input
                  type="number"
                  value={userData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 75000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Monthly Savings (₹)</label>
                <input
                  type="number"
                  value={userData.savings}
                  onChange={(e) => handleInputChange('savings', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 20000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Monthly Disposable Income (₹)</label>
                <input
                  type="number"
                  value={userData.disposableIncome}
                  onChange={(e) => handleInputChange('disposableIncome', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 25000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Monthly Expenditure (₹)</label>
                <input
                  type="number"
                  value={userData.expenditure}
                  onChange={(e) => handleInputChange('expenditure', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-slate-200">Monthly Debt/Loan Payments (₹)</label>
                <input
                  type="number"
                  value={userData.debt}
                  onChange={(e) => handleInputChange('debt', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 15000"
                />
              </div>
            </div>
            <button
              onClick={calculateResults}
              disabled={!userData.monthlyIncome}
              className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Discover The Real Middle
            </button>
          </div>
        )}

        {step === 3 && results && (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="card">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-4">Your Economic Reality</h2>
                <div className="bg-slate-700 px-6 py-3 rounded-lg inline-block border border-slate-600">
                  <span className="text-lg text-slate-200">You identified as: </span>
                  <span className="font-bold text-xl text-blue-400">{userData.perception}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-slate-700 rounded-lg border border-slate-600">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                  <div className="text-2xl font-bold mb-2" style={{ color: results.classInfo.color }}>
                    {results.classInfo.label}
                  </div>
                  <div className="text-slate-400">Your actual class</div>
                </div>
                
                <div className="text-center p-6 bg-slate-700 rounded-lg border border-slate-600">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {results.percentile.toFixed(1)}%
                  </div>
                  <div className="text-slate-400">Income percentile</div>
                </div>
                
                <div className="text-center p-6 bg-slate-700 rounded-lg border border-slate-600">
                  <Users className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {(results.peopleAbove / 1000000).toFixed(0)}M
                  </div>
                  <div className="text-slate-400">Indians earn less than you</div>
                </div>
              </div>

              {!showReveal && (
                <div className="text-center">
                  <button
                    onClick={() => setShowReveal(true)}
                    className="btn-primary"
                  >
                    Show Reality Check
                  </button>
                </div>
              )}

              {showReveal && (
                <div className="bg-amber-900/20 border border-amber-700/50 p-6 rounded-lg animate-fade-in">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-amber-300 mb-3">The Real Middle Revealed</h3>
                      <div className="space-y-2">
                        {results.surpriseFacts.map((fact, index) => (
                          <div key={index} className="text-slate-200 font-medium animate-slide-in-up" style={{animationDelay: `${index * 0.2}s`}}>
                            • {fact}
                          </div>
                        ))}
                        {!results.isReallyMiddleClass && results.percentile > 50 && (
                          <div className="text-amber-200 font-bold text-lg mt-4 p-4 bg-amber-900/30 rounded border border-amber-600 animate-glow">
                            You're not {userData.perception.toLowerCase()} - you're actually {results.classInfo.label.toLowerCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feature Navigation */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">Explore Different Aspects of Inequality</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setCurrentFeature(feature.id)}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      currentFeature === feature.id
                        ? 'bg-amber-600 border-amber-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <feature.icon className="w-5 h-5 mx-auto mb-2" />
                    <div className="text-xs font-medium">{feature.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Content */}
            <div className="card">
              {currentFeature === 'overview' && (
                <>
                  <h3 className="text-2xl font-semibold text-white mb-6 text-center">
                    India's Income Distribution (2023-24 Data)
                  </h3>
                  <div className="bg-slate-700/50 p-6 rounded-lg">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis 
                          dataKey="bracket" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                          stroke="#e2e8f0"
                        />
                        <YAxis 
                          label={{ value: 'Population %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#e2e8f0' } }}
                          stroke="#e2e8f0"
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Population']}
                          labelStyle={{ color: '#000' }}
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                        />
                        <Bar dataKey="population" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.isUser ? '#f59e0b' : entry.color}
                              stroke={entry.isUser ? '#d97706' : 'none'}
                              strokeWidth={entry.isUser ? 3 : 0}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-4">
                      {results && (
                        <div className="inline-flex items-center gap-2 bg-amber-600/20 px-4 py-2 rounded-lg border border-amber-600">
                          <div className="w-4 h-4 bg-amber-500 rounded"></div>
                          <span className="text-amber-300 font-semibold">Your Position</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {currentFeature === 'budget' && (
                <>
                  <h3 className="text-2xl font-semibold text-white mb-6 text-center">Budget Challenge</h3>
                  <p className="text-slate-300 text-center mb-8">
                    Try to allocate the median Indian income of ₹9,000/month. Can you cover basic survival needs?
                  </p>
                  <BudgetChallenge results={results} />
                </>
              )}

              {currentFeature === 'healthcare' && (
                <>
                  <h3 className="text-2xl font-semibold text-white mb-6 text-center">Healthcare Cost Reality</h3>
                  <HealthcareCostScenarios userIncome={results?.income} />
                </>
              )}

              {currentFeature === 'education' && (
                <>
                  <h3 className="text-2xl font-semibold text-white mb-6 text-center">Education Cost Barriers</h3>
                  <EducationCostBarriers />
                </>
              )}

              {currentFeature === 'rural-urban' && (
                <>
                  <h3 className="text-2xl font-semibold text-white mb-6 text-center">Rural vs Urban Divide</h3>
                  <RuralUrbanComparison />
                </>
              )}

              {currentFeature === 'poverty-trap' && (
                <>
                  <h3 className="text-2xl font-semibent text-white mb-6 text-center">Breaking the Poverty Cycle</h3>
                  <IntergenerationalPovertyTrap />
                </>
              )}

              {currentFeature === 'sources' && (
                <>
                  <h3 className="text-2xl font-semibold text-white mb-6 text-center">Data Sources & Methodology</h3>
                  <DataSources />
                </>
              )}
            </div>

            {/* Call to Action */}
            <div className="card text-center">
              <h3 className="text-2xl font-semibold text-white mb-4">Understanding Leads to Action</h3>
              <p className="text-slate-300 mb-6 max-w-3xl mx-auto">
                Income inequality in India is not just statistics—it represents millions of lives limited by circumstances of birth. 
                Understanding your economic position is the first step toward building a more equitable society.
              </p>
              <button
                onClick={() => {
                  setStep(1);
                  setCurrentFeature('overview');
                  setUserData({
                    monthlyIncome: '',
                    savings: '',
                    disposableIncome: '',
                    expenditure: '',
                    debt: '',
                    perception: ''
                  });
                  setResults(null);
                  setShowReveal(false);
                }}
                className="btn-secondary"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;