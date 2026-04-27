import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle } from "lucide-react";

const data = [
  { name: 'Income', importance: 0.85, isSensitive: false },
  { name: 'Credit Score', importance: 0.72, isSensitive: false },
  { name: 'Gender', importance: 0.65, isSensitive: true },
  { name: 'Employment Years', importance: 0.54, isSensitive: false },
  { name: 'Age', importance: 0.42, isSensitive: true },
  { name: 'Education Level', importance: 0.35, isSensitive: false },
];

export default function ShapChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card rounded-2xl border border-white/5 p-6 w-full mt-8"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Feature Importance (SHAP)</h3>
          <p className="text-sm text-muted-foreground">Impact of individual features on the model's decision-making.</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Standard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Sensitive Attribute</span>
          </div>
        </div>
      </div>
      
      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
            <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
            <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.8)', fontSize: 12}} width={120} />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.05)'}}
              contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value, name, props) => [
                <div key={name} className="flex items-center gap-2">
                  <span>{value}</span>
                  {props.payload.isSensitive && <AlertTriangle className="w-4 h-4 text-destructive" />}
                </div>, 
                "SHAP Value"
              ]}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isSensitive ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
