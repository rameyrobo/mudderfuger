import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';


type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormValues = { name: string; email: string; phone: string; message: string };

function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const onSubmit = async (data: { name: string; email: string; message: string }) => {
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/transactions/send-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSuccessMsg('Message sent!');
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1500);
      } else {
        const result = await res.json();
        setErrorMsg(result.error || 'Failed to send message.');
      }
    } catch {
      setErrorMsg('Network error.');
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="font-arial fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 pointer-events-auto">
      <div className="font-arial uppercase bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-3xl mb-7 font-bold">Contact Us</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <label htmlFor="name" className="font-arial block mb-1 font-medium">Name:</label>
          <input
            id="name"
            {...register('name', { required: 'Name is required' })}
            className="font-arial w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}

          {/* Email */}
          <label htmlFor="email" className="font-arial uppercase block mb-1 font-medium">Email:</label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            className="font-arial w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}

          {/* Phone */}
          <label htmlFor="phone" className="font-arial uppercase block mb-1 font-medium">Phone:</label>
          <input
            id="phone"
            type="tel"
            {...register('phone', {
              required: 'Phone is required',
              pattern: {
                value: /^[0-9+\-()\s]{7,}$/,
                message: 'Invalid phone number',
              },
            })}
            className="font-arial w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}

          {/* Message */}
          <label htmlFor="message" className="font-arial uppercase block mb-1 font-medium">Message:</label>
          <textarea
            id="message"
            {...register('message', { required: 'Message is required' })}
            className="font-arial w-full border border-gray-300 rounded px-3 py-2"
            rows={4}
          />
          {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>}

          {/* Feedback and buttons */}
          {errorMsg && <p className="text-red-600 text-sm mt-1">{errorMsg}</p>}
          {successMsg && <p className="text-green-600 text-sm mt-1">{successMsg}</p>}
          <div className="flex justify-end space-x-2">
            <button type="submit" disabled={submitting} className="font-arial uppercase bg-black text-white px-4 py-2 font-bold rounded hover:bg-gray-800 cursor-pointer">
              {submitting ? 'Sending...' : 'Submit'}
            </button>
            <button type="button" onClick={onClose} className="font-arial uppercase border border-gray-400 px-4 py-2 rounded hover:bg-gray-100 cursor-pointer font-bold">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactModal;