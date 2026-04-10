"use client"
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, MapPin } from 'lucide-react';
import { FormInput, FeedbackToast } from '../components/ui/FormElements';
import { PremiumButton, PremiumCard } from '../components/ui/PremiumComponents';
import { companyAPI } from '../services/api';

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing',
  'E-commerce', 'Consulting', 'Real Estate', 'Marketing', 'Other'
];

const CompanySetup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    revenue: '',
    expenses: '',
    employees: '',
    growthRate: '',
    location: '',
    logo: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Company name is required';
    if (!formData.industry) return 'Industry is required';
    if (isNaN(Number(formData.revenue)) || Number(formData.revenue) <= 0) return 'Valid revenue required';
    if (isNaN(Number(formData.expenses)) || Number(formData.expenses) < 0) return 'Valid expenses required';
    if (isNaN(Number(formData.employees)) || Number(formData.employees) <= 0) return 'Valid employee count required';
    if (isNaN(Number(formData.growthRate))) return 'Valid growth rate required';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setShowToast(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = {
        name: formData.name.trim(),
        industry: formData.industry,
        revenue: parseFloat(formData.revenue),
        expenses: parseFloat(formData.expenses),
        employees: parseInt(formData.employees),
        growthRate: parseFloat(formData.growthRate),
        location: formData.location.trim(),
        logo: formData.logo.trim() || null
      };

      await companyAPI.setup(data);

      setSuccess(true);
      setShowToast(true);

      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Setup failed. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-4 relative overflow-hidden">

      <motion.form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-2xl space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <PremiumCard className="p-8">

          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Company Setup
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <FormInput
              label="Company Name *"
              icon={<Building className="w-4 h-4" />}
              value={formData.name}
              onChange={handleChange}
              name="name"
            />

            <div>
              <label className="text-[#C0C0C0] text-sm">Industry *</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full mt-1 p-3 bg-black border border-gray-600 rounded"
              >
                <option value="">Select Industry</option>
                {industries.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>

            <FormInput label="Revenue *" type="number" name="revenue" value={formData.revenue} onChange={handleChange} />
            <FormInput label="Expenses" type="number" name="expenses" value={formData.expenses} onChange={handleChange} />
            <FormInput label="Employees *" type="number" name="employees" value={formData.employees} onChange={handleChange} />

            <FormInput
              label="Growth Rate (%)"
              type="number"
              name="growthRate"
              value={formData.growthRate}
              onChange={handleChange}
            />

            <FormInput
              label="Location"
              icon={<MapPin className="w-4 h-4" />}
              name="location"
              value={formData.location}
              onChange={handleChange}
            />

            <FormInput
              label="Logo URL"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
            />

          </div>

          <div className="mt-6 flex gap-4">
            <PremiumButton type="submit" loading={loading}>
              Generate Dashboard
            </PremiumButton>

            <PremiumButton type="button" onClick={() => navigate('/dashboard')}>
              Skip
            </PremiumButton>
          </div>

        </PremiumCard>
      </motion.form>

      {showToast && (
        <FeedbackToast
          type={success ? 'success' : 'error'}
          message={success ? 'Success!' : error}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default CompanySetup;