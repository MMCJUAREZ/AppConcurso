import React, { useState } from 'react';
import api from '../api/axios';
import { MapPin, User, Search, CheckCircle } from 'lucide-react';

const FindingForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    state: '', municipality: '', finding_type: 'unknown',
    estimated_sex: 'unknown', tattoos: '', scars: '',
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    try {
      await api.post('findings/', formData);
      alert("Registro guardado con éxito");
      setStep(1); // Reiniciar
    } catch (error) {
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      {/* Encabezado del Paso */}
      <div className="flex items-center justify-between mb-8">
        <span className={`h-2 w-full rounded-full mx-1 ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></span>
        <span className={`h-2 w-full rounded-full mx-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></span>
        <span className={`h-2 w-full rounded-full mx-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-blue-800"><MapPin/> Ubicación</h2>
          <input className="w-full p-3 border rounded-lg" placeholder="Estado (Ej. Veracruz)" 
                 onChange={(e) => setFormData({...formData, state: e.target.value})} />
          <input className="w-full p-3 border rounded-lg" placeholder="Municipio" 
                 onChange={(e) => setFormData({...formData, municipality: e.target.value})} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-blue-800"><User/> Datos Físicos</h2>
          <select className="w-full p-3 border rounded-lg" onChange={(e) => setFormData({...formData, estimated_sex: e.target.value})}>
            <option value="unknown">Sexo: Desconocido</option>
            <option value="woman">Mujer</option>
            <option value="man">Hombre</option>
          </select>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-blue-800"><Search/> Señas</h2>
          <textarea className="w-full p-3 border rounded-lg" placeholder="Tatuajes..." 
                    onChange={(e) => setFormData({...formData, tattoos: e.target.value})} />
          <textarea className="w-full p-3 border rounded-lg" placeholder="Cicatrices..." 
                    onChange={(e) => setFormData({...formData, scars: e.target.value})} />
        </div>
      )}

      <div className="flex justify-between mt-8">
        {step > 1 && <button onClick={prevStep} className="text-gray-500 font-medium">Atrás</button>}
        {step < 3 ? (
          <button onClick={nextStep} className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Siguiente</button>
        ) : (
          <button onClick={handleSubmit} className="ml-auto bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
            <CheckCircle size={18}/> Guardar Registro
          </button>
        )}
      </div>
    </div>
  );
};

export default FindingForm;
